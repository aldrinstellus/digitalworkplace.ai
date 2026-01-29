/**
 * Workflow Execution Engine
 * Actual execution engine for agentic workflows
 * - Executes workflow steps in sequence
 * - Connects LLM actions to Claude
 * - Handles API calls, notifications, conditions
 * - Supports webhook and scheduled triggers
 */

import { createClient } from '@supabase/supabase-js';
import Anthropic from '@anthropic-ai/sdk';
import type {
  WorkflowNodeType,
  TriggerConfig,
  SearchConfig,
  ActionConfig,
  ConditionConfig,
  TransformConfig,
  OutputConfig,
  ApprovalConfig,
  WorkflowStepDB,
  WorkflowEdgeDB,
} from './types';
import { createApprovalRequest } from './approval';

// =============================================================================
// TYPES
// =============================================================================

export interface ExecutionContext {
  workflowId: string;
  executionId: string;
  userId?: string;
  organizationId?: string;
  input: Record<string, unknown>;
  variables: Record<string, unknown>;
  stepOutputs: Record<string, unknown>;
  logs: ExecutionLog[];
  startedAt: Date;
  currentStepId?: string;
}

export interface ExecutionLog {
  timestamp: Date;
  level: 'info' | 'warn' | 'error' | 'debug';
  stepId?: string;
  message: string;
  data?: unknown;
}

export interface ExecutionResult {
  executionId: string;
  workflowId: string;
  status: 'completed' | 'failed' | 'cancelled' | 'timeout' | 'waiting_approval';
  output?: unknown;
  error?: string;
  startedAt: Date;
  completedAt: Date;
  duration: number;
  stepsExecuted: number;
  logs: ExecutionLog[];
  // V2.0: Approval info
  pendingApprovalId?: string;
  pendingApprovalStepId?: string;
}

export interface StepResult {
  success: boolean;
  output?: unknown;
  error?: string;
  nextStepId?: string | null;
  shouldContinue: boolean;
  // V2.0: Approval handling
  waitingForApproval?: boolean;
  approvalId?: string;
}

export interface WorkflowDefinition {
  id: string;
  name: string;
  trigger_type: string;
  trigger_config: Record<string, unknown>;
  steps: WorkflowStepDB[];
  edges: WorkflowEdgeDB[];
}

// =============================================================================
// WORKFLOW EXECUTOR
// =============================================================================

export class WorkflowExecutor {
  private supabase;
  private anthropic: Anthropic;
  private maxSteps = 100;
  private stepTimeout = 30000; // 30 seconds per step
  private executionTimeout = 300000; // 5 minutes total

  constructor() {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
    this.supabase = createClient(supabaseUrl, supabaseAnonKey);
    this.anthropic = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY!,
    });
  }

  // =============================================================================
  // MAIN EXECUTION
  // =============================================================================

  /**
   * Execute a workflow by ID
   */
  async execute(
    workflowId: string,
    input: Record<string, unknown> = {},
    options: { userId?: string; organizationId?: string } = {}
  ): Promise<ExecutionResult> {
    const startedAt = new Date();
    const executionId = crypto.randomUUID();

    // Create execution context
    const context: ExecutionContext = {
      workflowId,
      executionId,
      userId: options.userId,
      organizationId: options.organizationId,
      input,
      variables: { ...input },
      stepOutputs: {},
      logs: [],
      startedAt,
    };

    this.log(context, 'info', `Starting workflow execution: ${workflowId}`);

    try {
      // Load workflow definition
      const workflow = await this.loadWorkflow(workflowId);
      if (!workflow) {
        throw new Error(`Workflow not found: ${workflowId}`);
      }

      // Create execution record
      await this.createExecutionRecord(context, workflow.name);

      // Find trigger step
      const triggerStep = workflow.steps.find(s => s.step_type === 'trigger');
      if (!triggerStep) {
        throw new Error('Workflow has no trigger step');
      }

      // Execute workflow
      const output = await this.executeWorkflow(context, workflow, triggerStep.id);

      const completedAt = new Date();
      const result: ExecutionResult = {
        executionId,
        workflowId,
        status: 'completed',
        output,
        startedAt,
        completedAt,
        duration: completedAt.getTime() - startedAt.getTime(),
        stepsExecuted: Object.keys(context.stepOutputs).length,
        logs: context.logs,
      };

      // Update execution record
      await this.updateExecutionRecord(executionId, result);

      return result;
    } catch (error) {
      const completedAt = new Date();
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';

      this.log(context, 'error', `Workflow execution failed: ${errorMessage}`);

      const result: ExecutionResult = {
        executionId,
        workflowId,
        status: 'failed',
        error: errorMessage,
        startedAt,
        completedAt,
        duration: completedAt.getTime() - startedAt.getTime(),
        stepsExecuted: Object.keys(context.stepOutputs).length,
        logs: context.logs,
      };

      await this.updateExecutionRecord(executionId, result);

      return result;
    }
  }

  /**
   * Execute workflow starting from a step
   */
  private async executeWorkflow(
    context: ExecutionContext,
    workflow: WorkflowDefinition,
    startStepId: string
  ): Promise<unknown> {
    let currentStepId: string | null = startStepId;
    let stepsExecuted = 0;
    let lastOutput: unknown = context.input;

    // Build adjacency map from edges
    const edgeMap = this.buildEdgeMap(workflow.edges);

    while (currentStepId && stepsExecuted < this.maxSteps) {
      const step = workflow.steps.find(s => s.id === currentStepId);
      if (!step) {
        throw new Error(`Step not found: ${currentStepId}`);
      }

      context.currentStepId = currentStepId;
      this.log(context, 'info', `Executing step: ${step.step_name || step.id}`, { type: step.step_type });

      // Execute step with timeout
      const stepResult = await this.executeStepWithTimeout(context, step, lastOutput);

      // Store step output
      context.stepOutputs[currentStepId] = stepResult.output;
      context.variables[`step_${currentStepId}`] = stepResult.output;

      if (!stepResult.success) {
        this.log(context, 'error', `Step failed: ${stepResult.error}`);

        // Check for failure edge
        const currentEdges: WorkflowEdgeDB[] = edgeMap.get(currentStepId) || [];
        const failureEdge: WorkflowEdgeDB | undefined = currentEdges.find(
          (e: WorkflowEdgeDB) => e.source_handle === 'false' || e.label === 'failure'
        );

        if (failureEdge) {
          currentStepId = failureEdge.target_step_id;
          continue;
        }

        throw new Error(stepResult.error || 'Step execution failed');
      }

      lastOutput = stepResult.output;

      if (!stepResult.shouldContinue) {
        break;
      }

      // Find next step
      if (stepResult.nextStepId !== undefined) {
        currentStepId = stepResult.nextStepId;
      } else {
        // Use edges to find next step
        const outgoingEdges: WorkflowEdgeDB[] = edgeMap.get(currentStepId) || [];
        const nextEdge: WorkflowEdgeDB | undefined = outgoingEdges.find(
          (e: WorkflowEdgeDB) => e.source_handle === 'output' || e.source_handle === 'true' || !e.source_handle
        );
        currentStepId = nextEdge?.target_step_id || null;
      }

      stepsExecuted++;
    }

    if (stepsExecuted >= this.maxSteps) {
      throw new Error(`Maximum steps exceeded: ${this.maxSteps}`);
    }

    return lastOutput;
  }

  /**
   * Build edge map for quick lookup
   */
  private buildEdgeMap(edges: WorkflowEdgeDB[]): Map<string, WorkflowEdgeDB[]> {
    const map = new Map<string, WorkflowEdgeDB[]>();
    for (const edge of edges) {
      const existing = map.get(edge.source_step_id) || [];
      existing.push(edge);
      map.set(edge.source_step_id, existing);
    }
    return map;
  }

  /**
   * Execute step with timeout
   */
  private async executeStepWithTimeout(
    context: ExecutionContext,
    step: WorkflowStepDB,
    input: unknown
  ): Promise<StepResult> {
    return Promise.race([
      this.executeStep(context, step, input),
      new Promise<StepResult>((_, reject) =>
        setTimeout(() => reject(new Error('Step timeout')), this.stepTimeout)
      ),
    ]);
  }

  // =============================================================================
  // STEP EXECUTORS
  // =============================================================================

  /**
   * Execute a single step
   */
  private async executeStep(
    context: ExecutionContext,
    step: WorkflowStepDB,
    input: unknown
  ): Promise<StepResult> {
    const stepType = step.step_type as WorkflowNodeType;
    const config = step.config;

    switch (stepType) {
      case 'trigger':
        return this.executeTrigger(context, config as TriggerConfig, input);
      case 'search':
        return this.executeSearch(context, config as SearchConfig, input);
      case 'action':
        return this.executeAction(context, config as ActionConfig, input);
      case 'condition':
        return this.executeCondition(context, config as ConditionConfig, input);
      case 'transform':
        return this.executeTransform(context, config as TransformConfig, input);
      case 'output':
        return this.executeOutput(context, config as OutputConfig, input);
      case 'approval':
        return this.executeApproval(context, step, config as ApprovalConfig, input);
      default:
        return {
          success: false,
          error: `Unknown step type: ${stepType}`,
          shouldContinue: false,
        };
    }
  }

  /**
   * Execute approval step - pauses workflow for human approval
   * V2.0 Feature: Human-in-the-loop approval nodes
   */
  private async executeApproval(
    context: ExecutionContext,
    step: WorkflowStepDB,
    config: ApprovalConfig,
    input: unknown
  ): Promise<StepResult> {
    this.log(context, 'info', `Creating approval request for step: ${step.step_name || step.id}`);

    try {
      // Create approval request
      const approval = await createApprovalRequest({
        executionId: context.executionId,
        workflowId: context.workflowId,
        stepId: step.id,
        config,
        inputData: input as Record<string, unknown>,
      });

      this.log(context, 'info', `Approval request created: ${approval.id}`, {
        approvers: approval.approvers.length,
        required: approval.required_approvals,
      });

      // Return waiting status - execution will pause here
      return {
        success: true,
        output: {
          approvalId: approval.id,
          status: 'pending',
          approvers: approval.approvers,
          required: approval.required_approvals,
        },
        waitingForApproval: true,
        approvalId: approval.id,
        shouldContinue: false, // Stop execution until approval
      };
    } catch (error) {
      this.log(context, 'error', `Failed to create approval request: ${error}`);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to create approval',
        shouldContinue: false,
      };
    }
  }

  /**
   * Execute trigger step (validates trigger was invoked correctly)
   */
  private async executeTrigger(
    context: ExecutionContext,
    config: TriggerConfig,
    input: unknown
  ): Promise<StepResult> {
    this.log(context, 'debug', `Trigger type: ${config.triggerType}`);

    // Triggers pass through input to next step
    return {
      success: true,
      output: input,
      shouldContinue: true,
    };
  }

  /**
   * Execute search step
   */
  private async executeSearch(
    context: ExecutionContext,
    config: SearchConfig,
    input: unknown
  ): Promise<StepResult> {
    const searchType = config.searchType;
    const query = this.interpolateTemplate(config.query || config.queryTemplate || '', context);
    const maxResults = config.maxResults || 10;

    this.log(context, 'debug', `Search type: ${searchType}, query: ${query}`);

    try {
      let results: unknown[] = [];

      switch (searchType) {
        case 'knowledge_base':
          results = await this.searchKnowledgeBase(query, maxResults);
          break;
        case 'elasticsearch':
          results = await this.searchElasticsearch(query, config.filters, maxResults);
          break;
        case 'database':
          results = await this.searchDatabase(query, config, maxResults);
          break;
        case 'external':
          results = await this.searchExternal(config, query, maxResults);
          break;
      }

      return {
        success: true,
        output: { results, count: results.length, query },
        shouldContinue: true,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Search failed',
        shouldContinue: false,
      };
    }
  }

  /**
   * Execute action step
   */
  private async executeAction(
    context: ExecutionContext,
    config: ActionConfig,
    input: unknown
  ): Promise<StepResult> {
    const actionType = config.actionType;

    this.log(context, 'debug', `Action type: ${actionType}`);

    try {
      let output: unknown;

      switch (actionType) {
        case 'llm_call':
          output = await this.executeLLMCall(context, config.llm!, input);
          break;
        case 'api_call':
          output = await this.executeAPICall(context, config.api!, input);
          break;
        case 'notification':
          output = await this.executeNotification(context, config.notification!, input);
          break;
        case 'update_record':
        case 'create_record':
          output = await this.executeRecordOperation(context, config.record!, actionType);
          break;
        default:
          throw new Error(`Unknown action type: ${actionType}`);
      }

      return {
        success: true,
        output,
        shouldContinue: true,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Action failed',
        shouldContinue: false,
      };
    }
  }

  /**
   * Execute condition step
   */
  private async executeCondition(
    context: ExecutionContext,
    config: ConditionConfig,
    input: unknown
  ): Promise<StepResult> {
    const conditionType = config.conditionType;

    this.log(context, 'debug', `Condition type: ${conditionType}`);

    try {
      let result: boolean;

      switch (conditionType) {
        case 'simple':
          result = this.evaluateSimpleCondition(config.simple!, input, context);
          break;
        case 'script':
          result = await this.evaluateScript(config.script?.code || '', input, context);
          break;
        case 'llm_decision':
          result = await this.evaluateLLMDecision(config.llmDecision!, input);
          break;
        default:
          throw new Error(`Unknown condition type: ${conditionType}`);
      }

      return {
        success: true,
        output: result,
        nextStepId: undefined, // Let edges handle routing based on true/false
        shouldContinue: true,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Condition evaluation failed',
        shouldContinue: false,
      };
    }
  }

  /**
   * Execute transform step
   */
  private async executeTransform(
    context: ExecutionContext,
    config: TransformConfig,
    input: unknown
  ): Promise<StepResult> {
    const transformType = config.transformType;

    this.log(context, 'debug', `Transform type: ${transformType}`);

    try {
      let output: unknown;

      switch (transformType) {
        case 'map':
          output = this.transformMap(config.map!, input);
          break;
        case 'filter':
          output = this.transformFilter(config.filter!, input);
          break;
        case 'aggregate':
          output = this.transformAggregate(config.aggregate!, input);
          break;
        case 'merge':
          output = this.transformMerge(config.merge!, context);
          break;
        case 'custom':
          output = await this.transformCustom(config.custom?.code || '', input, context);
          break;
        default:
          output = input;
      }

      return {
        success: true,
        output,
        shouldContinue: true,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Transform failed',
        shouldContinue: false,
      };
    }
  }

  /**
   * Execute output step
   */
  private async executeOutput(
    context: ExecutionContext,
    config: OutputConfig,
    input: unknown
  ): Promise<StepResult> {
    const outputType = config.outputType;

    this.log(context, 'debug', `Output type: ${outputType}`);

    try {
      let output: unknown = input;

      // Format output
      if (config.template) {
        output = this.interpolateTemplate(config.template, { ...context, input });
      }

      switch (outputType) {
        case 'return':
          // Just return the output
          break;
        case 'store':
          await this.storeOutput(config.store!, output, context);
          break;
        case 'webhook':
          await this.sendWebhook(config.webhook!, output);
          break;
        case 'log':
          this.log(context, 'info', 'Output', output);
          break;
      }

      return {
        success: true,
        output,
        shouldContinue: false, // Output is terminal
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Output failed',
        shouldContinue: false,
      };
    }
  }

  // =============================================================================
  // ACTION IMPLEMENTATIONS
  // =============================================================================

  /**
   * Execute LLM call using Claude
   */
  private async executeLLMCall(
    context: ExecutionContext,
    config: NonNullable<ActionConfig['llm']>,
    input: unknown
  ): Promise<unknown> {
    const prompt = this.interpolateTemplate(config.prompt || '', { ...context, input });
    const model = config.model || 'claude-sonnet-4-20250514';
    const temperature = config.temperature ?? 0.7;
    const maxTokens = config.maxTokens || 1024;

    this.log(context, 'debug', `LLM call: model=${model}, prompt length=${prompt.length}`);

    const response = await this.anthropic.messages.create({
      model,
      max_tokens: maxTokens,
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
    });

    const textContent = response.content.find(c => c.type === 'text');
    return {
      response: textContent?.text || '',
      model: response.model,
      usage: response.usage,
    };
  }

  /**
   * Execute API call
   */
  private async executeAPICall(
    context: ExecutionContext,
    config: NonNullable<ActionConfig['api']>,
    input: unknown
  ): Promise<unknown> {
    const url = this.interpolateTemplate(config.url || '', context);
    const method = config.method || 'GET';
    const headers = config.headers || {};
    let body = config.body;

    if (body) {
      body = this.interpolateTemplate(body, { ...context, input });
    }

    this.log(context, 'debug', `API call: ${method} ${url}`);

    const response = await fetch(url, {
      method,
      headers: {
        'Content-Type': 'application/json',
        ...headers,
      },
      body: body ? (typeof body === 'string' ? body : JSON.stringify(body)) : undefined,
    });

    const responseText = await response.text();
    let responseData: unknown;

    try {
      responseData = JSON.parse(responseText);
    } catch {
      responseData = responseText;
    }

    if (!response.ok) {
      throw new Error(`API call failed: ${response.status} ${response.statusText}`);
    }

    return {
      status: response.status,
      data: responseData,
    };
  }

  /**
   * Execute notification
   */
  private async executeNotification(
    context: ExecutionContext,
    config: NonNullable<ActionConfig['notification']>,
    input: unknown
  ): Promise<unknown> {
    const notificationType = config.type || 'in_app';
    const recipients = config.recipients || [];
    const subject = this.interpolateTemplate(config.subject || '', { ...context, input });
    const body = this.interpolateTemplate(config.template || '', { ...context, input });

    this.log(context, 'debug', `Notification: type=${notificationType}, recipients=${recipients.length}`);

    switch (notificationType) {
      case 'in_app':
        // Create in-app notifications
        for (const recipient of recipients) {
          await this.supabase.schema('diq').from('notifications').insert({
            user_id: recipient,
            type: 'workflow',
            title: subject,
            message: body,
            entity_type: 'workflow_execution',
            entity_id: context.executionId,
            actor_id: context.userId,
          });
        }
        break;
      case 'email':
        // Email would be sent via external service
        this.log(context, 'info', `Email notification queued: ${subject}`);
        break;
      case 'slack':
        // Slack webhook integration
        this.log(context, 'info', `Slack notification queued: ${subject}`);
        break;
      case 'teams':
        // Teams webhook integration
        this.log(context, 'info', `Teams notification queued: ${subject}`);
        break;
    }

    return {
      type: notificationType,
      recipients: recipients.length,
      sent: true,
    };
  }

  /**
   * Execute record operation
   */
  private async executeRecordOperation(
    context: ExecutionContext,
    config: NonNullable<ActionConfig['record']>,
    operation: 'create_record' | 'update_record'
  ): Promise<unknown> {
    const table = config.table;
    const data = config.data || {};

    if (!table) {
      throw new Error('Table name is required for record operations');
    }

    this.log(context, 'debug', `Record operation: ${operation} on ${table}`);

    // Interpolate data values
    const processedData: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(data)) {
      if (typeof value === 'string') {
        processedData[key] = this.interpolateTemplate(value, context);
      } else {
        processedData[key] = value;
      }
    }

    if (operation === 'create_record') {
      const { data: result, error } = await this.supabase
        .schema('diq')
        .from(table)
        .insert(processedData)
        .select()
        .single();

      if (error) throw error;
      return result;
    } else {
      // Update requires an id
      const id = processedData.id;
      delete processedData.id;

      const { data: result, error } = await this.supabase
        .schema('diq')
        .from(table)
        .update(processedData)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return result;
    }
  }

  // =============================================================================
  // SEARCH IMPLEMENTATIONS
  // =============================================================================

  private async searchKnowledgeBase(query: string, limit: number): Promise<unknown[]> {
    const { data } = await this.supabase
      .schema('diq')
      .from('articles')
      .select('id, title, excerpt, category_id')
      .textSearch('title', query, { type: 'websearch' })
      .limit(limit);

    return data || [];
  }

  private async searchElasticsearch(
    query: string,
    filters?: Record<string, unknown>,
    limit?: number
  ): Promise<unknown[]> {
    // Call internal search API
    const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || ''}/api/search`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query, filters, limit }),
    });

    const data = await response.json();
    return data.results || [];
  }

  private async searchDatabase(
    query: string,
    config: SearchConfig,
    limit: number
  ): Promise<unknown[]> {
    // Generic database search
    const table = (config as unknown as { table?: string }).table || 'articles';
    const { data } = await this.supabase
      .schema('diq')
      .from(table)
      .select('*')
      .ilike('title', `%${query}%`)
      .limit(limit);

    return data || [];
  }

  private async searchExternal(
    config: SearchConfig,
    query: string,
    limit: number
  ): Promise<unknown[]> {
    // External API search
    const url = (config as unknown as { url?: string }).url;
    if (!url) return [];

    const response = await fetch(`${url}?q=${encodeURIComponent(query)}&limit=${limit}`);
    const data = await response.json();
    return Array.isArray(data) ? data : data.results || [];
  }

  // =============================================================================
  // CONDITION IMPLEMENTATIONS
  // =============================================================================

  private evaluateSimpleCondition(
    config: NonNullable<ConditionConfig['simple']>,
    input: unknown,
    context: ExecutionContext
  ): boolean {
    const field = config.field || '';
    const operator = config.operator || 'equals';
    const compareValue = this.interpolateTemplate(config.value || '', context);

    // Get field value from input
    const fieldValue = this.getNestedValue(input, field);

    switch (operator) {
      case 'equals':
        return String(fieldValue) === String(compareValue);
      case 'not_equals':
        return String(fieldValue) !== String(compareValue);
      case 'contains':
        return String(fieldValue).includes(String(compareValue));
      case 'greater_than':
        return Number(fieldValue) > Number(compareValue);
      case 'less_than':
        return Number(fieldValue) < Number(compareValue);
      case 'is_empty':
        return !fieldValue || (Array.isArray(fieldValue) && fieldValue.length === 0);
      case 'is_not_empty':
        return !!fieldValue && (!Array.isArray(fieldValue) || fieldValue.length > 0);
      default:
        return false;
    }
  }

  private async evaluateScript(
    code: string,
    input: unknown,
    context: ExecutionContext
  ): Promise<boolean> {
    // Safe script evaluation using Function constructor
    // Note: In production, use a proper sandbox like vm2 or isolated-vm
    try {
      const fn = new Function('input', 'context', `return (${code})`);
      const result = fn(input, context);
      return Boolean(result);
    } catch {
      return false;
    }
  }

  private async evaluateLLMDecision(
    config: NonNullable<ConditionConfig['llmDecision']>,
    input: unknown
  ): Promise<boolean> {
    const prompt = `Based on the following input and criteria, answer with only "yes" or "no".

Input: ${JSON.stringify(input)}

Criteria: ${config.criteria?.join(', ') || config.prompt}

Answer (yes/no):`;

    const response = await this.anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 10,
      messages: [{ role: 'user', content: prompt }],
    });

    const text = response.content.find(c => c.type === 'text')?.text || '';
    return text.toLowerCase().includes('yes');
  }

  // =============================================================================
  // TRANSFORM IMPLEMENTATIONS
  // =============================================================================

  private transformMap(
    config: NonNullable<TransformConfig['map']>,
    input: unknown
  ): unknown {
    if (!Array.isArray(input)) {
      // Map single object
      const result: Record<string, unknown> = {};
      for (const mapping of config.mappings || []) {
        result[mapping.to] = this.getNestedValue(input, mapping.from);
      }
      return result;
    }

    // Map array
    return input.map(item => {
      const result: Record<string, unknown> = {};
      for (const mapping of config.mappings || []) {
        result[mapping.to] = this.getNestedValue(item, mapping.from);
      }
      return result;
    });
  }

  private transformFilter(
    config: NonNullable<TransformConfig['filter']>,
    input: unknown
  ): unknown {
    if (!Array.isArray(input)) return input;

    const condition = config.condition || '';
    return input.filter(item => {
      try {
        const fn = new Function('item', `return ${condition}`);
        return fn(item);
      } catch {
        return true;
      }
    });
  }

  private transformAggregate(
    config: NonNullable<TransformConfig['aggregate']>,
    input: unknown
  ): unknown {
    if (!Array.isArray(input)) return input;

    const operation = config.operation || 'count';
    const field = config.field || '';

    switch (operation) {
      case 'count':
        return input.length;
      case 'sum':
        return input.reduce((acc, item) => acc + (Number(this.getNestedValue(item, field)) || 0), 0);
      case 'average':
        const sum = input.reduce((acc, item) => acc + (Number(this.getNestedValue(item, field)) || 0), 0);
        return input.length > 0 ? sum / input.length : 0;
      case 'min':
        return Math.min(...input.map(item => Number(this.getNestedValue(item, field)) || 0));
      case 'max':
        return Math.max(...input.map(item => Number(this.getNestedValue(item, field)) || 0));
      default:
        return input;
    }
  }

  private transformMerge(
    config: NonNullable<TransformConfig['merge']>,
    context: ExecutionContext
  ): unknown {
    const sources = config.sources || [];
    const strategy = config.strategy || 'merge';

    const sourceData = sources.map(source => context.stepOutputs[source] || context.variables[source]);

    switch (strategy) {
      case 'concat':
        return sourceData.flat();
      case 'merge':
        return Object.assign({}, ...sourceData.filter(d => typeof d === 'object'));
      case 'zip':
        const maxLen = Math.max(...sourceData.map(d => Array.isArray(d) ? d.length : 1));
        return Array.from({ length: maxLen }, (_, i) =>
          sourceData.map(d => Array.isArray(d) ? d[i] : d)
        );
      default:
        return sourceData;
    }
  }

  private async transformCustom(
    code: string,
    input: unknown,
    context: ExecutionContext
  ): Promise<unknown> {
    try {
      const fn = new Function('input', 'context', code);
      return fn(input, context);
    } catch (error) {
      throw new Error(`Custom transform failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // =============================================================================
  // OUTPUT IMPLEMENTATIONS
  // =============================================================================

  private async storeOutput(
    config: NonNullable<OutputConfig['store']>,
    output: unknown,
    context: ExecutionContext
  ): Promise<void> {
    const table = config.table || 'workflow_outputs';

    await this.supabase.schema('diq').from(table).insert({
      workflow_id: context.workflowId,
      execution_id: context.executionId,
      output: output,
      created_at: new Date().toISOString(),
    });
  }

  private async sendWebhook(
    config: NonNullable<OutputConfig['webhook']>,
    output: unknown
  ): Promise<void> {
    const url = config.url;
    const method = config.method || 'POST';

    if (!url) return;

    await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(output),
    });
  }

  // =============================================================================
  // HELPER METHODS
  // =============================================================================

  private async loadWorkflow(workflowId: string): Promise<WorkflowDefinition | null> {
    const { data: workflow, error: workflowError } = await this.supabase
      .schema('diq')
      .from('workflows')
      .select('*')
      .eq('id', workflowId)
      .single();

    if (workflowError || !workflow) return null;

    const { data: steps } = await this.supabase
      .schema('diq')
      .from('workflow_steps')
      .select('*')
      .eq('workflow_id', workflowId)
      .order('step_number', { ascending: true });

    const { data: edges } = await this.supabase
      .schema('diq')
      .from('workflow_edges')
      .select('*')
      .eq('workflow_id', workflowId);

    return {
      id: workflow.id,
      name: workflow.name,
      trigger_type: workflow.trigger_type,
      trigger_config: workflow.trigger_config,
      steps: (steps || []).map(s => ({
        ...s,
        step_type: s.type,
        step_name: s.name,
      })),
      edges: edges || [],
    };
  }

  private async createExecutionRecord(
    context: ExecutionContext,
    workflowName: string
  ): Promise<void> {
    await this.supabase.schema('diq').from('workflow_executions').insert({
      id: context.executionId,
      workflow_id: context.workflowId,
      status: 'running',
      started_at: context.startedAt.toISOString(),
      input_data: context.input,
      triggered_by: context.userId,
    });
  }

  private async updateExecutionRecord(
    executionId: string,
    result: ExecutionResult
  ): Promise<void> {
    await this.supabase
      .schema('diq')
      .from('workflow_executions')
      .update({
        status: result.status,
        completed_at: result.completedAt.toISOString(),
        output_data: result.output,
        error_message: result.error,
        execution_time_ms: result.duration,
      })
      .eq('id', executionId);
  }

  private log(
    context: ExecutionContext,
    level: ExecutionLog['level'],
    message: string,
    data?: unknown
  ): void {
    const log: ExecutionLog = {
      timestamp: new Date(),
      level,
      stepId: context.currentStepId,
      message,
      data,
    };
    context.logs.push(log);

    if (process.env.NODE_ENV === 'development') {
      console.log(`[Workflow ${context.executionId}] [${level.toUpperCase()}] ${message}`, data || '');
    }
  }

  private interpolateTemplate(template: string, context: ExecutionContext | Record<string, unknown>): string {
    return template.replace(/\{\{([^}]+)\}\}/g, (_, path) => {
      const value = this.getNestedValue(context, path.trim());
      return value !== undefined ? String(value) : '';
    });
  }

  private getNestedValue(obj: unknown, path: string): unknown {
    if (!path || typeof obj !== 'object' || obj === null) return undefined;

    const parts = path.split('.');
    let current: unknown = obj;

    for (const part of parts) {
      if (current === null || current === undefined) return undefined;
      current = (current as Record<string, unknown>)[part];
    }

    return current;
  }
}

// =============================================================================
// WEBHOOK TRIGGER HANDLER
// =============================================================================

export async function handleWebhookTrigger(
  workflowId: string,
  payload: Record<string, unknown>,
  headers: Record<string, string>
): Promise<ExecutionResult> {
  const executor = new WorkflowExecutor();
  return executor.execute(workflowId, { payload, headers });
}

// =============================================================================
// SCHEDULED TRIGGER HANDLER
// =============================================================================

export async function handleScheduledTrigger(
  workflowId: string,
  scheduledTime: Date
): Promise<ExecutionResult> {
  const executor = new WorkflowExecutor();
  return executor.execute(workflowId, { scheduledTime: scheduledTime.toISOString() });
}

// =============================================================================
// SINGLETON EXPORT
// =============================================================================

let executorInstance: WorkflowExecutor | null = null;

export function getWorkflowExecutor(): WorkflowExecutor {
  if (!executorInstance) {
    executorInstance = new WorkflowExecutor();
  }
  return executorInstance;
}

export default WorkflowExecutor;
