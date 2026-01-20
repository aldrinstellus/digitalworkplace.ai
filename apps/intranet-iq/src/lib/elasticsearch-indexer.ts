/**
 * Elasticsearch Indexing Service
 * Syncs content from Supabase to Elasticsearch for dIQ search
 */

import { createClient } from "@supabase/supabase-js";
import {
  indexDocumentsBulk,
  deleteDocument,
  createSearchIndex,
  getIndexStats,
  SearchableDocument,
  IndexStats,
} from "./elasticsearch";
import { generateEmbedding } from "./embeddings";

// ============================================================================
// Types
// ============================================================================

export interface IndexingResult {
  success: boolean;
  indexed: number;
  errors: number;
  duration: number; // milliseconds
  message?: string;
}

export interface SyncOptions {
  generateEmbeddings?: boolean;
  batchSize?: number;
  types?: SearchableDocument["type"][];
}

// ============================================================================
// Supabase Client
// ============================================================================

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

function getSupabaseAdmin() {
  return createClient(supabaseUrl, supabaseServiceKey, {
    auth: { persistSession: false },
  });
}

// ============================================================================
// Content Fetchers
// ============================================================================

/**
 * Fetch articles from Supabase
 */
async function fetchArticles(): Promise<SearchableDocument[]> {
  const supabase = getSupabaseAdmin();

  const { data, error } = await supabase
    .from("diq_articles")
    .select(
      `
      id,
      title,
      content,
      excerpt,
      slug,
      status,
      category_id,
      author_id,
      created_at,
      updated_at,
      diq_kb_categories(name),
      diq_employees(first_name, last_name)
    `
    )
    .eq("status", "published");

  if (error) {
    console.error("[Indexer] Failed to fetch articles:", error);
    return [];
  }

  return (data || []).map((article) => ({
    id: `article-${article.id}`,
    title: article.title,
    content: article.content || "",
    excerpt: article.excerpt || article.content?.substring(0, 300),
    type: "article" as const,
    category: (article.diq_kb_categories as { name?: string } | null)?.name,
    author: article.diq_employees
      ? `${(article.diq_employees as { first_name?: string }).first_name} ${(article.diq_employees as { last_name?: string }).last_name}`
      : undefined,
    authorId: article.author_id,
    createdAt: article.created_at,
    updatedAt: article.updated_at,
    url: `/diq/content/articles/${article.slug}`,
  }));
}

/**
 * Fetch FAQs from knowledge items
 */
async function fetchFAQs(): Promise<SearchableDocument[]> {
  const supabase = getSupabaseAdmin();

  const { data, error } = await supabase
    .from("knowledge_items")
    .select("*")
    .eq("project_code", "dIQ")
    .eq("item_type", "faq");

  if (error) {
    console.error("[Indexer] Failed to fetch FAQs:", error);
    return [];
  }

  return (data || []).map((faq) => ({
    id: `faq-${faq.id}`,
    title: faq.title,
    content: faq.content || "",
    excerpt: faq.content?.substring(0, 300),
    type: "faq" as const,
    tags: faq.tags,
    createdAt: faq.created_at,
    updatedAt: faq.updated_at,
  }));
}

/**
 * Fetch news posts
 */
async function fetchNews(): Promise<SearchableDocument[]> {
  const supabase = getSupabaseAdmin();

  const { data, error } = await supabase
    .from("diq_news_posts")
    .select(
      `
      id,
      title,
      content,
      excerpt,
      status,
      author_id,
      created_at,
      updated_at,
      diq_employees(first_name, last_name)
    `
    )
    .eq("status", "published");

  if (error) {
    console.error("[Indexer] Failed to fetch news:", error);
    return [];
  }

  return (data || []).map((news) => ({
    id: `news-${news.id}`,
    title: news.title,
    content: news.content || "",
    excerpt: news.excerpt || news.content?.substring(0, 300),
    type: "news" as const,
    author: news.diq_employees
      ? `${(news.diq_employees as { first_name?: string }).first_name} ${(news.diq_employees as { last_name?: string }).last_name}`
      : undefined,
    authorId: news.author_id,
    createdAt: news.created_at,
    updatedAt: news.updated_at,
    url: `/diq/news/${news.id}`,
  }));
}

/**
 * Fetch events
 */
async function fetchEvents(): Promise<SearchableDocument[]> {
  const supabase = getSupabaseAdmin();

  const { data, error } = await supabase
    .from("diq_events")
    .select("*")
    .gte("end_time", new Date().toISOString());

  if (error) {
    console.error("[Indexer] Failed to fetch events:", error);
    return [];
  }

  return (data || []).map((event) => ({
    id: `event-${event.id}`,
    title: event.title,
    content: event.description || "",
    excerpt: event.description?.substring(0, 300),
    type: "event" as const,
    metadata: {
      location: event.location,
      startTime: event.start_time,
      endTime: event.end_time,
    },
    createdAt: event.created_at,
    updatedAt: event.created_at,
    url: `/diq/events/${event.id}`,
  }));
}

/**
 * Fetch employees (for people directory search)
 */
async function fetchEmployees(): Promise<SearchableDocument[]> {
  const supabase = getSupabaseAdmin();

  const { data, error } = await supabase.from("diq_employees").select(
    `
      id,
      first_name,
      last_name,
      email,
      job_title,
      bio,
      skills,
      department_id,
      created_at,
      diq_departments(name)
    `
  );

  if (error) {
    console.error("[Indexer] Failed to fetch employees:", error);
    return [];
  }

  return (data || []).map((emp) => ({
    id: `employee-${emp.id}`,
    title: `${emp.first_name} ${emp.last_name}`,
    content: `${emp.job_title || ""} ${emp.bio || ""} ${(emp.skills || []).join(" ")}`,
    excerpt: emp.job_title || "",
    type: "employee" as const,
    department: (emp.diq_departments as { name?: string } | null)?.name,
    tags: emp.skills,
    metadata: {
      email: emp.email,
      jobTitle: emp.job_title,
    },
    createdAt: emp.created_at,
    updatedAt: emp.created_at,
    url: `/diq/people/${emp.id}`,
  }));
}

/**
 * Fetch workflows
 */
async function fetchWorkflows(): Promise<SearchableDocument[]> {
  const supabase = getSupabaseAdmin();

  const { data, error } = await supabase
    .from("diq_workflows")
    .select("*")
    .eq("status", "active");

  if (error) {
    console.error("[Indexer] Failed to fetch workflows:", error);
    return [];
  }

  return (data || []).map((wf) => ({
    id: `workflow-${wf.id}`,
    title: wf.name,
    content: wf.description || "",
    excerpt: wf.description?.substring(0, 300),
    type: "workflow" as const,
    category: wf.category,
    tags: wf.tags,
    createdAt: wf.created_at,
    updatedAt: wf.updated_at,
    url: `/diq/agents/${wf.id}`,
  }));
}

/**
 * Fetch general documents from knowledge_items
 */
async function fetchDocuments(): Promise<SearchableDocument[]> {
  const supabase = getSupabaseAdmin();

  const { data, error } = await supabase
    .from("knowledge_items")
    .select("*")
    .eq("project_code", "dIQ")
    .in("item_type", ["document", "policy", "procedure"]);

  if (error) {
    console.error("[Indexer] Failed to fetch documents:", error);
    return [];
  }

  return (data || []).map((doc) => ({
    id: `document-${doc.id}`,
    title: doc.title,
    content: doc.content || "",
    excerpt: doc.content?.substring(0, 300),
    type: "document" as const,
    tags: doc.tags,
    metadata: doc.metadata,
    createdAt: doc.created_at,
    updatedAt: doc.updated_at,
  }));
}

// ============================================================================
// Main Indexing Functions
// ============================================================================

/**
 * Full sync - reindex all content from Supabase to Elasticsearch
 */
export async function fullSync(options: SyncOptions = {}): Promise<IndexingResult> {
  const { generateEmbeddings = false, batchSize = 100, types } = options;
  const startTime = Date.now();

  console.log("[Indexer] Starting full sync...");

  try {
    // Ensure index exists
    await createSearchIndex();

    // Fetch all content types
    const fetchPromises: Promise<SearchableDocument[]>[] = [];
    const typeFilter = types || [
      "article",
      "faq",
      "news",
      "event",
      "employee",
      "workflow",
      "document",
    ];

    if (typeFilter.includes("article")) fetchPromises.push(fetchArticles());
    if (typeFilter.includes("faq")) fetchPromises.push(fetchFAQs());
    if (typeFilter.includes("news")) fetchPromises.push(fetchNews());
    if (typeFilter.includes("event")) fetchPromises.push(fetchEvents());
    if (typeFilter.includes("employee")) fetchPromises.push(fetchEmployees());
    if (typeFilter.includes("workflow")) fetchPromises.push(fetchWorkflows());
    if (typeFilter.includes("document")) fetchPromises.push(fetchDocuments());

    const results = await Promise.all(fetchPromises);
    let allDocuments = results.flat();

    console.log(`[Indexer] Fetched ${allDocuments.length} documents`);

    // Generate embeddings if requested
    if (generateEmbeddings && allDocuments.length > 0) {
      console.log("[Indexer] Generating embeddings...");
      const docsWithEmbeddings: SearchableDocument[] = [];

      for (const doc of allDocuments) {
        try {
          const textToEmbed = `${doc.title}\n\n${doc.content}`.substring(0, 8000);
          const embedding = await generateEmbedding(textToEmbed);
          docsWithEmbeddings.push({ ...doc, embedding });
        } catch (error) {
          console.error(`[Indexer] Failed to generate embedding for ${doc.id}:`, error);
          docsWithEmbeddings.push(doc); // Add without embedding
        }
      }

      allDocuments = docsWithEmbeddings;
      console.log(`[Indexer] Generated ${docsWithEmbeddings.filter((d) => d.embedding).length} embeddings`);
    }

    // Index in batches
    let totalIndexed = 0;
    let totalErrors = 0;

    for (let i = 0; i < allDocuments.length; i += batchSize) {
      const batch = allDocuments.slice(i, i + batchSize);
      const { indexed, errors } = await indexDocumentsBulk(batch);
      totalIndexed += indexed;
      totalErrors += errors;

      console.log(
        `[Indexer] Batch ${Math.floor(i / batchSize) + 1}: indexed ${indexed}, errors ${errors}`
      );
    }

    const duration = Date.now() - startTime;

    console.log(
      `[Indexer] Full sync complete: ${totalIndexed} indexed, ${totalErrors} errors in ${duration}ms`
    );

    return {
      success: totalErrors === 0,
      indexed: totalIndexed,
      errors: totalErrors,
      duration,
      message: `Indexed ${totalIndexed} documents with ${totalErrors} errors`,
    };
  } catch (error) {
    const duration = Date.now() - startTime;
    console.error("[Indexer] Full sync failed:", error);

    return {
      success: false,
      indexed: 0,
      errors: 1,
      duration,
      message: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Index a single item (for real-time updates)
 */
export async function indexSingleItem(
  type: SearchableDocument["type"],
  id: string,
  generateEmbedding_: boolean = false
): Promise<boolean> {
  const supabase = getSupabaseAdmin();
  let doc: SearchableDocument | null = null;

  try {
    switch (type) {
      case "article": {
        const { data } = await supabase
          .from("diq_articles")
          .select(
            `
            id, title, content, excerpt, slug, status, category_id, author_id, created_at, updated_at,
            diq_kb_categories(name),
            diq_employees(first_name, last_name)
          `
          )
          .eq("id", id)
          .single();

        if (data) {
          doc = {
            id: `article-${data.id}`,
            title: data.title,
            content: data.content || "",
            excerpt: data.excerpt || data.content?.substring(0, 300),
            type: "article",
            category: (data.diq_kb_categories as { name?: string } | null)?.name,
            author: data.diq_employees
              ? `${(data.diq_employees as { first_name?: string }).first_name} ${(data.diq_employees as { last_name?: string }).last_name}`
              : undefined,
            authorId: data.author_id,
            createdAt: data.created_at,
            updatedAt: data.updated_at,
            url: `/diq/content/articles/${data.slug}`,
          };
        }
        break;
      }

      case "employee": {
        const { data } = await supabase
          .from("diq_employees")
          .select(
            `
            id, first_name, last_name, email, job_title, bio, skills, department_id, created_at,
            diq_departments(name)
          `
          )
          .eq("id", id)
          .single();

        if (data) {
          doc = {
            id: `employee-${data.id}`,
            title: `${data.first_name} ${data.last_name}`,
            content: `${data.job_title || ""} ${data.bio || ""} ${(data.skills || []).join(" ")}`,
            excerpt: data.job_title || "",
            type: "employee",
            department: (data.diq_departments as { name?: string } | null)?.name,
            tags: data.skills,
            metadata: { email: data.email, jobTitle: data.job_title },
            createdAt: data.created_at,
            updatedAt: data.created_at,
            url: `/diq/people/${data.id}`,
          };
        }
        break;
      }

      // Add more cases for other types as needed
    }

    if (!doc) {
      console.error(`[Indexer] Document not found: ${type}-${id}`);
      return false;
    }

    // Generate embedding if requested
    if (generateEmbedding_) {
      try {
        const textToEmbed = `${doc.title}\n\n${doc.content}`.substring(0, 8000);
        doc.embedding = await generateEmbedding(textToEmbed);
      } catch (error) {
        console.error(`[Indexer] Failed to generate embedding:`, error);
      }
    }

    const { indexed } = await indexDocumentsBulk([doc]);
    return indexed === 1;
  } catch (error) {
    console.error(`[Indexer] Failed to index single item:`, error);
    return false;
  }
}

/**
 * Remove a document from the index
 */
export async function removeFromIndex(
  type: SearchableDocument["type"],
  id: string
): Promise<boolean> {
  try {
    const docId = `${type}-${id}`;
    await deleteDocument(docId);
    console.log(`[Indexer] Removed document: ${docId}`);
    return true;
  } catch (error) {
    console.error(`[Indexer] Failed to remove document:`, error);
    return false;
  }
}

/**
 * Get indexing statistics
 */
export async function getIndexingStats(): Promise<IndexStats | null> {
  try {
    return await getIndexStats();
  } catch (error) {
    console.error("[Indexer] Failed to get stats:", error);
    return null;
  }
}

/**
 * Generate demo content for testing (PRD requirement: 100-500 mock items)
 */
export async function generateDemoContent(count: number = 200): Promise<IndexingResult> {
  const startTime = Date.now();

  const demoArticles: SearchableDocument[] = [];
  const categories = ["Engineering", "HR", "Finance", "Marketing", "Operations", "Legal"];
  const departments = ["Product", "Engineering", "Sales", "Support", "HR", "Finance"];

  const titles = [
    "Getting Started Guide",
    "Company Policies Overview",
    "Benefits Enrollment Process",
    "Remote Work Guidelines",
    "Security Best Practices",
    "Expense Report Procedures",
    "Performance Review Process",
    "Team Communication Standards",
    "Project Management Framework",
    "Customer Support Handbook",
  ];

  for (let i = 0; i < count; i++) {
    const type = ["article", "document", "faq", "news"][i % 4] as SearchableDocument["type"];
    const baseTitle = titles[i % titles.length];

    demoArticles.push({
      id: `demo-${type}-${i}`,
      title: `${baseTitle} - Part ${Math.floor(i / 10) + 1}`,
      content: `This is demo content for ${baseTitle}. It contains important information about company procedures, guidelines, and best practices. ${" ".repeat(50).split("").map(() => "Lorem ipsum dolor sit amet, consectetur adipiscing elit.").join(" ")}`,
      excerpt: `Demo excerpt for ${baseTitle}. This document covers essential information for all employees.`,
      type,
      category: categories[i % categories.length],
      department: departments[i % departments.length],
      author: `Demo Author ${(i % 5) + 1}`,
      tags: ["demo", categories[i % categories.length].toLowerCase(), type],
      createdAt: new Date(Date.now() - i * 86400000).toISOString(),
      updatedAt: new Date(Date.now() - i * 43200000).toISOString(),
    });
  }

  console.log(`[Indexer] Indexing ${count} demo documents...`);

  try {
    await createSearchIndex();
    const { indexed, errors } = await indexDocumentsBulk(demoArticles);
    const duration = Date.now() - startTime;

    return {
      success: errors === 0,
      indexed,
      errors,
      duration,
      message: `Generated and indexed ${indexed} demo documents`,
    };
  } catch (error) {
    const duration = Date.now() - startTime;
    return {
      success: false,
      indexed: 0,
      errors: count,
      duration,
      message: error instanceof Error ? error.message : "Unknown error",
    };
  }
}
