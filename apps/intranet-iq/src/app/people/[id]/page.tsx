"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { Sidebar } from "@/components/layout/Sidebar";
import { FadeIn } from "@/lib/motion";
import {
  ArrowLeft,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Building2,
  Users,
  MessageSquare,
  Video,
  Star,
  Award,
  Briefcase,
  GraduationCap,
  Link2,
  Github,
  Linkedin,
  Twitter,
  Loader2,
  AlertCircle,
  Clock,
  FileText,
  ChevronRight,
  ExternalLink,
  Zap,
} from "lucide-react";
import Link from "next/link";
import { getAppPresenceForEmployee } from "@/lib/crossReferences";
import { getAllActivity, getAllTasks } from "@/lib/integratedData";
import { SOURCE_DISPLAY, type UnifiedActivity, type UnifiedTask, type UnifiedEvent } from "@/lib/unifiedTypes";
import { mockZoomMeetings } from "@/lib/mockAppsData";
import { getUpcomingZoomMeetingsForUser, getLiveZoomMeetingsForUser } from "@/lib/dataTransformers/zoomTransformer";

// Source icons for cross-app activity
const SOURCE_ICONS: Record<string, string> = {
  slack: "💬",
  jira: "📋",
  github: "🐙",
  drive: "📁",
  zoom: "📹",
  confluence: "📝",
  salesforce: "💼",
  figma: "🎨",
  notion: "📓",
  linkedin: "💼",
  diq: "🏢",
};

// Get cross-app activity for an employee
const getCrossAppActivity = (employeeEmail: string): UnifiedActivity[] => {
  const allActivityData = getAllActivity(50);
  const allActivity = allActivityData.activities;
  // Filter activity that involves this employee (by email match in author/actor)
  return allActivity.filter((activity: UnifiedActivity) =>
    activity.actor?.email?.toLowerCase() === employeeEmail.toLowerCase() ||
    activity.actor?.name?.toLowerCase().includes(employeeEmail.split('@')[0].toLowerCase())
  ).slice(0, 10);
};

// Get cross-app tasks for an employee
const getCrossAppTasks = (employeeEmail: string): UnifiedTask[] => {
  const allTasksData = getAllTasks();
  const allTasks = allTasksData.tasks;
  // Filter tasks assigned to this employee
  return allTasks.filter((task: UnifiedTask) =>
    task.assignee?.email?.toLowerCase() === employeeEmail.toLowerCase() ||
    task.assignee?.name?.toLowerCase().includes(employeeEmail.split('@')[0].toLowerCase())
  ).slice(0, 5);
};

// Get Zoom schedule for an employee
const getZoomSchedule = (employeeName: string): { upcoming: UnifiedEvent[]; live: UnifiedEvent[] } => {
  const upcoming = getUpcomingZoomMeetingsForUser(mockZoomMeetings, employeeName);
  const live = getLiveZoomMeetingsForUser(mockZoomMeetings, employeeName);
  return { upcoming: upcoming.slice(0, 3), live };
};

// Comprehensive mock employee data
const mockEmployeesData: Record<string, EmployeeProfile> = {
  "1": {
    id: "1",
    user_id: "user-1",
    full_name: "Sarah Chen",
    email: "sarah.chen@digitalworkplace.ai",
    phone: "+1 (415) 555-0101",
    avatar: "SC",
    job_title: "Chief Executive Officer",
    department: {
      id: "exec",
      name: "Executive Team",
      description: "Company leadership and strategic direction",
    },
    location: "San Francisco, CA",
    timezone: "America/Los_Angeles",
    hire_date: "2019-03-15",
    bio: "Sarah is the founder and CEO of Digital Workplace AI. With over 15 years of experience in enterprise software, she leads our mission to transform how companies work through AI-powered tools. Before founding Digital Workplace AI, Sarah was VP of Product at Salesforce and led product at two successful startups.",
    skills: ["Leadership", "Product Strategy", "Enterprise Sales", "AI/ML", "Public Speaking", "Board Management"],
    education: [
      { degree: "MBA", school: "Stanford Graduate School of Business", year: "2012" },
      { degree: "BS Computer Science", school: "MIT", year: "2008" },
    ],
    experience: [
      { title: "CEO & Founder", company: "Digital Workplace AI", period: "2019 - Present", description: "Leading company strategy, fundraising, and growth" },
      { title: "VP of Product", company: "Salesforce", period: "2015 - 2019", description: "Led product strategy for Service Cloud" },
      { title: "Director of Product", company: "Zendesk", period: "2012 - 2015", description: "Built and scaled support automation features" },
    ],
    manager: null,
    direct_reports: [
      { id: "2", name: "Mike Johnson", title: "VP Engineering", avatar: "MJ" },
      { id: "3", name: "Lisa Park", title: "HR Director", avatar: "LP" },
      { id: "4", name: "James Wilson", title: "Product Lead", avatar: "JW" },
      { id: "6", name: "Emily Rodriguez", title: "VP Customer Success", avatar: "ER" },
    ],
    social: {
      linkedin: "https://linkedin.com/in/sarahchen",
      twitter: "https://twitter.com/sarahchen",
      github: null,
    },
    recent_activity: [
      { type: "post", title: "Q4 2025 Company Results", date: "2026-01-28", link: "/news/1" },
      { type: "event", title: "Q1 All-Hands Meeting", date: "2026-02-03", link: "/events/1" },
      { type: "article", title: "Company Vision 2026", date: "2026-01-20", link: "/content/10" },
    ],
    achievements: [
      { title: "Forbes 40 Under 40", year: "2023" },
      { title: "Inc. Best Workplaces", year: "2024" },
      { title: "Series B Fundraise - $50M", year: "2024" },
    ],
    availability: {
      status: "available",
      working_hours: "9 AM - 6 PM PT",
      next_available: null,
    },
    pronouns: "she/her",
    birthday: "March 15",
    work_anniversary: "March 15",
  },
  "2": {
    id: "2",
    user_id: "user-2",
    full_name: "Mike Johnson",
    email: "mike.johnson@digitalworkplace.ai",
    phone: "+1 (415) 555-0102",
    avatar: "MJ",
    job_title: "VP of Engineering",
    department: {
      id: "eng",
      name: "Engineering",
      description: "Building and scaling our technology platform",
    },
    location: "San Francisco, CA",
    timezone: "America/Los_Angeles",
    hire_date: "2020-06-01",
    bio: "Mike leads our engineering team of 60+ engineers. He's passionate about building scalable systems and fostering a culture of engineering excellence. Previously, Mike was a Principal Engineer at Google where he worked on Google Workspace infrastructure.",
    skills: ["System Architecture", "Distributed Systems", "Team Leadership", "Python", "Go", "Kubernetes", "AWS"],
    education: [
      { degree: "MS Computer Science", school: "UC Berkeley", year: "2010" },
      { degree: "BS Computer Science", school: "University of Washington", year: "2008" },
    ],
    experience: [
      { title: "VP of Engineering", company: "Digital Workplace AI", period: "2020 - Present", description: "Leading engineering team and technical strategy" },
      { title: "Principal Engineer", company: "Google", period: "2014 - 2020", description: "Google Workspace infrastructure team" },
      { title: "Senior Engineer", company: "Amazon", period: "2010 - 2014", description: "AWS EC2 team" },
    ],
    manager: { id: "1", name: "Sarah Chen", title: "CEO", avatar: "SC" },
    direct_reports: [
      { id: "7", name: "Alex Kim", title: "Staff Engineer", avatar: "AK" },
      { id: "8", name: "Nina Patel", title: "Principal Platform Engineer", avatar: "NP" },
      { id: "9", name: "Jordan Williams", title: "Senior Frontend Engineer", avatar: "JW" },
    ],
    social: {
      linkedin: "https://linkedin.com/in/mikejohnson",
      twitter: null,
      github: "https://github.com/mikej",
    },
    recent_activity: [
      { type: "post", title: "Welcome New Engineering Team Members", date: "2026-01-27", link: "/news/2" },
      { type: "event", title: "Engineering Team Offsite", date: "2026-02-10", link: "/events/2" },
    ],
    achievements: [
      { title: "Built engineering team from 10 to 60+", year: "2024" },
      { title: "99.99% platform uptime", year: "2025" },
    ],
    availability: {
      status: "in_meeting",
      working_hours: "9 AM - 6 PM PT",
      next_available: "3:00 PM PT",
    },
    pronouns: "he/him",
    birthday: "August 22",
    work_anniversary: "June 1",
  },
  "3": {
    id: "3",
    user_id: "user-3",
    full_name: "Lisa Park",
    email: "lisa.park@digitalworkplace.ai",
    phone: "+1 (415) 555-0103",
    avatar: "LP",
    job_title: "HR Director",
    department: {
      id: "hr",
      name: "Human Resources",
      description: "People operations, culture, and employee experience",
    },
    location: "San Francisco, CA",
    timezone: "America/Los_Angeles",
    hire_date: "2020-09-15",
    bio: "Lisa oversees all people operations at Digital Workplace AI, including talent acquisition, employee experience, and organizational development. She's built our culture from the ground up and is passionate about creating inclusive workplaces where everyone can do their best work.",
    skills: ["People Operations", "Talent Acquisition", "Employee Experience", "DEI", "Compensation", "HRIS"],
    education: [
      { degree: "MS Organizational Psychology", school: "Columbia University", year: "2014" },
      { degree: "BA Psychology", school: "UCLA", year: "2012" },
    ],
    experience: [
      { title: "HR Director", company: "Digital Workplace AI", period: "2020 - Present", description: "Building people operations from scratch" },
      { title: "HR Manager", company: "Stripe", period: "2017 - 2020", description: "Employee experience and culture programs" },
      { title: "HR Coordinator", company: "Airbnb", period: "2014 - 2017", description: "Recruiting and onboarding" },
    ],
    manager: { id: "1", name: "Sarah Chen", title: "CEO", avatar: "SC" },
    direct_reports: [
      { id: "10", name: "Amanda Foster", title: "Benefits Manager", avatar: "AF" },
      { id: "11", name: "Tom Martinez", title: "Recruiter", avatar: "TM" },
    ],
    social: {
      linkedin: "https://linkedin.com/in/lisapark",
      twitter: null,
      github: null,
    },
    recent_activity: [
      { type: "post", title: "Updated Remote Work Policy", date: "2026-01-25", link: "/news/3" },
      { type: "article", title: "Employee Benefits Guide 2026", date: "2026-01-01", link: "/content/3" },
    ],
    achievements: [
      { title: "Great Place to Work Certified", year: "2024" },
      { title: "Grew team from 20 to 150+", year: "2025" },
    ],
    availability: {
      status: "available",
      working_hours: "8 AM - 5 PM PT",
      next_available: null,
    },
    pronouns: "she/her",
    birthday: "November 8",
    work_anniversary: "September 15",
  },
  "4": {
    id: "4",
    user_id: "user-4",
    full_name: "James Wilson",
    email: "james.wilson@digitalworkplace.ai",
    phone: "+1 (415) 555-0104",
    avatar: "JW",
    job_title: "Product Lead",
    department: {
      id: "product",
      name: "Product",
      description: "Product strategy, design, and management",
    },
    location: "New York, NY",
    timezone: "America/New_York",
    hire_date: "2021-01-10",
    bio: "James leads product strategy and roadmap for Digital Workplace AI. He's shipped products used by millions of users and is obsessed with creating delightful user experiences. James believes in data-informed decisions and close collaboration with engineering and design.",
    skills: ["Product Management", "User Research", "Data Analysis", "Agile", "Roadmapping", "A/B Testing"],
    education: [
      { degree: "MBA", school: "Harvard Business School", year: "2016" },
      { degree: "BS Industrial Engineering", school: "Georgia Tech", year: "2012" },
    ],
    experience: [
      { title: "Product Lead", company: "Digital Workplace AI", period: "2021 - Present", description: "Leading product strategy and roadmap" },
      { title: "Senior PM", company: "Slack", period: "2018 - 2021", description: "Enterprise features and integrations" },
      { title: "PM", company: "Asana", period: "2016 - 2018", description: "Core task management features" },
    ],
    manager: { id: "1", name: "Sarah Chen", title: "CEO", avatar: "SC" },
    direct_reports: [
      { id: "12", name: "Rachel Kim", title: "Product Manager", avatar: "RK" },
      { id: "13", name: "David Lee", title: "Product Designer", avatar: "DL" },
    ],
    social: {
      linkedin: "https://linkedin.com/in/jameswilson",
      twitter: "https://twitter.com/jameswilson",
      github: null,
    },
    recent_activity: [
      { type: "post", title: "AI Assistant 3.0 Launch", date: "2026-01-24", link: "/news/4" },
      { type: "event", title: "Product Demo Day", date: "2026-02-07", link: "/events/4" },
    ],
    achievements: [
      { title: "Launched AI Assistant 3.0", year: "2026" },
      { title: "Product Hunt #1 Product of the Day", year: "2024" },
    ],
    availability: {
      status: "busy",
      working_hours: "9 AM - 6 PM ET",
      next_available: "Tomorrow 10 AM ET",
    },
    pronouns: "he/him",
    birthday: "April 3",
    work_anniversary: "January 10",
  },
  "5": {
    id: "5",
    user_id: "user-5",
    full_name: "Emily Rodriguez",
    email: "emily.rodriguez@digitalworkplace.ai",
    phone: "+1 (415) 555-0105",
    avatar: "ER",
    job_title: "VP of Customer Success",
    department: {
      id: "cs",
      name: "Customer Success",
      description: "Customer onboarding, support, and growth",
    },
    location: "Austin, TX",
    timezone: "America/Chicago",
    hire_date: "2021-04-01",
    bio: "Emily leads our customer success organization, ensuring our enterprise customers achieve their goals with Digital Workplace AI. She's built CSM teams at multiple SaaS companies and is passionate about turning customers into advocates.",
    skills: ["Customer Success", "Account Management", "SaaS Metrics", "Executive Relationships", "Renewals", "Upsells"],
    education: [
      { degree: "MBA", school: "UT Austin McCombs", year: "2015" },
      { degree: "BA Communications", school: "University of Texas", year: "2011" },
    ],
    experience: [
      { title: "VP Customer Success", company: "Digital Workplace AI", period: "2021 - Present", description: "Building and scaling CS organization" },
      { title: "Director of CS", company: "HubSpot", period: "2018 - 2021", description: "Enterprise customer success team" },
      { title: "CSM", company: "Salesforce", period: "2015 - 2018", description: "Strategic accounts" },
    ],
    manager: { id: "1", name: "Sarah Chen", title: "CEO", avatar: "SC" },
    direct_reports: [
      { id: "14", name: "Chris O'Brien", title: "Senior CSM", avatar: "CO" },
      { id: "15", name: "Priya Sharma", title: "CSM", avatar: "PS" },
    ],
    social: {
      linkedin: "https://linkedin.com/in/emilyrodriguez",
      twitter: null,
      github: null,
    },
    recent_activity: [
      { type: "event", title: "Customer Advisory Board", date: "2026-02-14", link: "/events/6" },
    ],
    achievements: [
      { title: "127% Net Revenue Retention", year: "2025" },
      { title: "4.8/5 Customer Satisfaction Score", year: "2025" },
    ],
    availability: {
      status: "available",
      working_hours: "8 AM - 5 PM CT",
      next_available: null,
    },
    pronouns: "she/her",
    birthday: "July 19",
    work_anniversary: "April 1",
  },
};

// Types
interface Department {
  id: string;
  name: string;
  description: string;
}

interface Person {
  id: string;
  name: string;
  title: string;
  avatar: string;
}

interface Education {
  degree: string;
  school: string;
  year: string;
}

interface Experience {
  title: string;
  company: string;
  period: string;
  description: string;
}

interface Activity {
  type: string;
  title: string;
  date: string;
  link: string;
}

interface Achievement {
  title: string;
  year: string;
}

interface Availability {
  status: "available" | "busy" | "in_meeting" | "away";
  working_hours: string;
  next_available: string | null;
}

interface EmployeeProfile {
  id: string;
  user_id: string;
  full_name: string;
  email: string;
  phone: string;
  avatar: string;
  job_title: string;
  department: Department;
  location: string;
  timezone: string;
  hire_date: string;
  bio: string;
  skills: string[];
  education: Education[];
  experience: Experience[];
  manager: Person | null;
  direct_reports: Person[];
  social: {
    linkedin: string | null;
    twitter: string | null;
    github: string | null;
  };
  recent_activity: Activity[];
  achievements: Achievement[];
  availability: Availability;
  pronouns: string;
  birthday: string;
  work_anniversary: string;
}

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
}

function getTenure(hireDate: string): string {
  const hire = new Date(hireDate);
  const now = new Date();
  const years = Math.floor((now.getTime() - hire.getTime()) / (365.25 * 24 * 60 * 60 * 1000));
  const months = Math.floor(((now.getTime() - hire.getTime()) % (365.25 * 24 * 60 * 60 * 1000)) / (30.44 * 24 * 60 * 60 * 1000));
  if (years === 0) return `${months} months`;
  if (months === 0) return `${years} years`;
  return `${years} years, ${months} months`;
}

function getStatusColor(status: string): string {
  switch (status) {
    case "available": return "bg-green-500";
    case "busy": return "bg-red-500";
    case "in_meeting": return "bg-yellow-500";
    case "away": return "bg-gray-500";
    default: return "bg-gray-500";
  }
}

export default function EmployeeProfilePage() {
  const params = useParams();
  const [employee, setEmployee] = useState<EmployeeProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"overview" | "team" | "activity">("overview");
  const [activityTab, setActivityTab] = useState<"all" | "slack" | "jira" | "github">("all");

  useEffect(() => {
    const id = params.id as string;
    setTimeout(() => {
      setEmployee(mockEmployeesData[id] || null);
      setLoading(false);
    }, 500);
  }, [params.id]);

  if (loading) {
    return (
      <div className="flex h-screen bg-[var(--bg-obsidian)]">
        <Sidebar />
        <main className="flex-1 overflow-y-auto">
          <div className="max-w-4xl mx-auto px-6 py-8">
            <div className="flex items-center justify-center h-64">
              <Loader2 className="w-8 h-8 text-[var(--accent-ember)] animate-spin" />
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (!employee) {
    return (
      <div className="flex h-screen bg-[var(--bg-obsidian)]">
        <Sidebar />
        <main className="flex-1 overflow-y-auto">
          <div className="max-w-4xl mx-auto px-6 py-8">
            <FadeIn>
              <div className="text-center py-16">
                <AlertCircle className="w-16 h-16 text-[var(--text-muted)] mx-auto mb-4" />
                <h1 className="text-2xl font-bold text-[var(--text-primary)] mb-2">Employee Not Found</h1>
                <p className="text-[var(--text-secondary)] mb-6">The employee profile you&apos;re looking for doesn&apos;t exist.</p>
                <Link href="/people" className="inline-flex items-center gap-2 px-4 py-2 bg-[var(--accent-ember)] text-white rounded-lg">
                  <ArrowLeft className="w-4 h-4" /> Back to Directory
                </Link>
              </div>
            </FadeIn>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-[var(--bg-obsidian)]">
      <Sidebar />
      <main className="flex-1 overflow-y-auto">
        <div className="max-w-4xl mx-auto px-6 py-8">
          {/* Back Button */}
          <FadeIn>
            <Link href="/people" className="inline-flex items-center gap-2 text-[var(--text-secondary)] hover:text-[var(--accent-ember)] transition-colors mb-6">
              <ArrowLeft className="w-4 h-4" /> Back to Directory
            </Link>
          </FadeIn>

          {/* Profile Header */}
          <FadeIn delay={0.1}>
            <div className="bg-[var(--bg-charcoal)] border border-[var(--border-subtle)] rounded-xl p-6 mb-6">
              <div className="flex items-start gap-6">
                <div className="relative">
                  <div className="w-24 h-24 rounded-full bg-gradient-to-br from-[var(--accent-ember)] to-[var(--accent-gold)] flex items-center justify-center text-white text-3xl font-bold">
                    {employee.avatar}
                  </div>
                  <div className={`absolute bottom-1 right-1 w-5 h-5 rounded-full border-2 border-[var(--bg-charcoal)] ${getStatusColor(employee.availability.status)}`} />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-1">
                    <h1 className="text-2xl font-bold text-[var(--text-primary)]">{employee.full_name}</h1>
                    <span className="text-[var(--text-muted)]">({employee.pronouns})</span>
                  </div>
                  <p className="text-lg text-[var(--accent-ember)] mb-2">{employee.job_title}</p>
                  <div className="flex items-center gap-4 text-sm text-[var(--text-secondary)] flex-wrap">
                    <span className="flex items-center gap-1">
                      <Building2 className="w-4 h-4" /> {employee.department.name}
                    </span>
                    <span className="flex items-center gap-1">
                      <MapPin className="w-4 h-4" /> {employee.location}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-4 h-4" /> {employee.availability.working_hours}
                    </span>
                  </div>
                </div>
                <div className="flex flex-col gap-2">
                  <a href={`mailto:${employee.email}`} className="flex items-center gap-2 px-4 py-2 bg-[var(--accent-ember)] text-white rounded-lg hover:bg-[var(--accent-ember-soft)] transition-colors">
                    <Mail className="w-4 h-4" /> Email
                  </a>
                  <button className="flex items-center gap-2 px-4 py-2 bg-[var(--bg-slate)] text-[var(--text-secondary)] rounded-lg hover:bg-[var(--bg-obsidian)] transition-colors">
                    <MessageSquare className="w-4 h-4" /> Message
                  </button>
                  <button className="flex items-center gap-2 px-4 py-2 bg-[var(--bg-slate)] text-[var(--text-secondary)] rounded-lg hover:bg-[var(--bg-obsidian)] transition-colors">
                    <Video className="w-4 h-4" /> Meet
                  </button>
                </div>
              </div>

              {/* Contact Info */}
              <div className="flex items-center gap-6 mt-6 pt-6 border-t border-[var(--border-subtle)]">
                <a href={`mailto:${employee.email}`} className="flex items-center gap-2 text-[var(--text-secondary)] hover:text-[var(--accent-ember)]">
                  <Mail className="w-4 h-4" /> {employee.email}
                </a>
                <a href={`tel:${employee.phone}`} className="flex items-center gap-2 text-[var(--text-secondary)] hover:text-[var(--accent-ember)]">
                  <Phone className="w-4 h-4" /> {employee.phone}
                </a>
                {employee.social.linkedin && (
                  <a href={employee.social.linkedin} target="_blank" rel="noopener noreferrer" className="text-[var(--text-secondary)] hover:text-[var(--accent-ember)]">
                    <Linkedin className="w-5 h-5" />
                  </a>
                )}
                {employee.social.twitter && (
                  <a href={employee.social.twitter} target="_blank" rel="noopener noreferrer" className="text-[var(--text-secondary)] hover:text-[var(--accent-ember)]">
                    <Twitter className="w-5 h-5" />
                  </a>
                )}
                {employee.social.github && (
                  <a href={employee.social.github} target="_blank" rel="noopener noreferrer" className="text-[var(--text-secondary)] hover:text-[var(--accent-ember)]">
                    <Github className="w-5 h-5" />
                  </a>
                )}
              </div>
            </div>
          </FadeIn>

          {/* Tabs */}
          <FadeIn delay={0.15}>
            <div className="flex gap-2 mb-6">
              {(["overview", "team", "activity"] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-4 py-2 rounded-lg transition-colors capitalize ${
                    activeTab === tab
                      ? "bg-[var(--accent-ember)] text-white"
                      : "bg-[var(--bg-charcoal)] text-[var(--text-secondary)] hover:bg-[var(--bg-slate)]"
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>
          </FadeIn>

          {/* Tab Content */}
          {activeTab === "overview" && (
            <>
              {/* Bio */}
              <FadeIn delay={0.2}>
                <div className="bg-[var(--bg-charcoal)] border border-[var(--border-subtle)] rounded-xl p-6 mb-6">
                  <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-4">About</h3>
                  <p className="text-[var(--text-secondary)] leading-relaxed">{employee.bio}</p>
                </div>
              </FadeIn>

              {/* Skills */}
              <FadeIn delay={0.25}>
                <div className="bg-[var(--bg-charcoal)] border border-[var(--border-subtle)] rounded-xl p-6 mb-6">
                  <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-4">Skills</h3>
                  <div className="flex flex-wrap gap-2">
                    {employee.skills.map((skill) => (
                      <span key={skill} className="px-3 py-1 bg-[var(--bg-slate)] border border-[var(--border-subtle)] rounded-full text-sm text-[var(--text-secondary)]">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              </FadeIn>

              {/* Experience */}
              <FadeIn delay={0.3}>
                <div className="bg-[var(--bg-charcoal)] border border-[var(--border-subtle)] rounded-xl p-6 mb-6">
                  <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-4 flex items-center gap-2">
                    <Briefcase className="w-5 h-5 text-[var(--accent-ember)]" /> Experience
                  </h3>
                  <div className="space-y-4">
                    {employee.experience.map((exp, index) => (
                      <div key={index} className="relative pl-6 pb-4 border-l-2 border-[var(--border-subtle)] last:pb-0">
                        <div className="absolute left-[-5px] top-1 w-2 h-2 rounded-full bg-[var(--accent-ember)]" />
                        <h4 className="text-[var(--text-primary)] font-medium">{exp.title}</h4>
                        <p className="text-[var(--accent-ember)] text-sm">{exp.company}</p>
                        <p className="text-[var(--text-muted)] text-sm">{exp.period}</p>
                        <p className="text-[var(--text-secondary)] text-sm mt-1">{exp.description}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </FadeIn>

              {/* Education */}
              <FadeIn delay={0.35}>
                <div className="bg-[var(--bg-charcoal)] border border-[var(--border-subtle)] rounded-xl p-6 mb-6">
                  <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-4 flex items-center gap-2">
                    <GraduationCap className="w-5 h-5 text-[var(--accent-ember)]" /> Education
                  </h3>
                  <div className="space-y-3">
                    {employee.education.map((edu, index) => (
                      <div key={index} className="flex items-center justify-between">
                        <div>
                          <p className="text-[var(--text-primary)] font-medium">{edu.degree}</p>
                          <p className="text-[var(--text-secondary)] text-sm">{edu.school}</p>
                        </div>
                        <span className="text-[var(--text-muted)]">{edu.year}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </FadeIn>

              {/* Achievements */}
              {employee.achievements.length > 0 && (
                <FadeIn delay={0.4}>
                  <div className="bg-[var(--bg-charcoal)] border border-[var(--border-subtle)] rounded-xl p-6 mb-6">
                    <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-4 flex items-center gap-2">
                      <Award className="w-5 h-5 text-[var(--accent-gold)]" /> Achievements
                    </h3>
                    <div className="space-y-3">
                      {employee.achievements.map((achievement, index) => (
                        <div key={index} className="flex items-center justify-between p-3 bg-[var(--bg-slate)] rounded-lg">
                          <div className="flex items-center gap-3">
                            <Star className="w-5 h-5 text-[var(--accent-gold)]" />
                            <span className="text-[var(--text-primary)]">{achievement.title}</span>
                          </div>
                          <span className="text-[var(--text-muted)]">{achievement.year}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </FadeIn>
              )}

              {/* Info Cards */}
              <FadeIn delay={0.45}>
                <div className="grid grid-cols-3 gap-4">
                  <div className="bg-[var(--bg-charcoal)] border border-[var(--border-subtle)] rounded-xl p-4 text-center">
                    <Calendar className="w-6 h-6 text-[var(--accent-ember)] mx-auto mb-2" />
                    <p className="text-[var(--text-muted)] text-sm">Hire Date</p>
                    <p className="text-[var(--text-primary)] font-medium">{formatDate(employee.hire_date)}</p>
                    <p className="text-[var(--text-secondary)] text-sm">{getTenure(employee.hire_date)}</p>
                  </div>
                  <div className="bg-[var(--bg-charcoal)] border border-[var(--border-subtle)] rounded-xl p-4 text-center">
                    <Calendar className="w-6 h-6 text-[var(--accent-gold)] mx-auto mb-2" />
                    <p className="text-[var(--text-muted)] text-sm">Birthday</p>
                    <p className="text-[var(--text-primary)] font-medium">{employee.birthday}</p>
                  </div>
                  <div className="bg-[var(--bg-charcoal)] border border-[var(--border-subtle)] rounded-xl p-4 text-center">
                    <Star className="w-6 h-6 text-[var(--accent-ember)] mx-auto mb-2" />
                    <p className="text-[var(--text-muted)] text-sm">Work Anniversary</p>
                    <p className="text-[var(--text-primary)] font-medium">{employee.work_anniversary}</p>
                  </div>
                </div>
              </FadeIn>
            </>
          )}

          {activeTab === "team" && (
            <>
              {/* Manager */}
              {employee.manager && (
                <FadeIn delay={0.2}>
                  <div className="bg-[var(--bg-charcoal)] border border-[var(--border-subtle)] rounded-xl p-6 mb-6">
                    <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-4">Reports To</h3>
                    <Link href={`/people/${employee.manager.id}`} className="flex items-center gap-4 p-3 bg-[var(--bg-slate)] rounded-lg hover:bg-[var(--bg-obsidian)] transition-colors">
                      <div className="w-12 h-12 rounded-full bg-[var(--accent-ember)]/20 flex items-center justify-center text-[var(--accent-ember)] font-medium">
                        {employee.manager.avatar}
                      </div>
                      <div>
                        <p className="text-[var(--text-primary)] font-medium">{employee.manager.name}</p>
                        <p className="text-[var(--text-muted)] text-sm">{employee.manager.title}</p>
                      </div>
                      <ChevronRight className="w-5 h-5 text-[var(--text-muted)] ml-auto" />
                    </Link>
                  </div>
                </FadeIn>
              )}

              {/* Direct Reports */}
              {employee.direct_reports.length > 0 && (
                <FadeIn delay={0.25}>
                  <div className="bg-[var(--bg-charcoal)] border border-[var(--border-subtle)] rounded-xl p-6 mb-6">
                    <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-4">
                      Direct Reports ({employee.direct_reports.length})
                    </h3>
                    <div className="space-y-2">
                      {employee.direct_reports.map((report) => (
                        <Link key={report.id} href={`/people/${report.id}`} className="flex items-center gap-4 p-3 bg-[var(--bg-slate)] rounded-lg hover:bg-[var(--bg-obsidian)] transition-colors">
                          <div className="w-10 h-10 rounded-full bg-[var(--accent-gold)]/20 flex items-center justify-center text-[var(--accent-gold)] font-medium text-sm">
                            {report.avatar}
                          </div>
                          <div>
                            <p className="text-[var(--text-primary)] font-medium">{report.name}</p>
                            <p className="text-[var(--text-muted)] text-sm">{report.title}</p>
                          </div>
                          <ChevronRight className="w-5 h-5 text-[var(--text-muted)] ml-auto" />
                        </Link>
                      ))}
                    </div>
                  </div>
                </FadeIn>
              )}
            </>
          )}

          {activeTab === "activity" && (
            <>
              {/* dIQ Platform Activity */}
              <FadeIn delay={0.2}>
                <div className="bg-[var(--bg-charcoal)] border border-[var(--border-subtle)] rounded-xl p-6 mb-6">
                  <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-4 flex items-center gap-2">
                    <span className="text-xl">🏢</span> Platform Activity
                  </h3>
                  {employee.recent_activity.length > 0 ? (
                    <div className="space-y-3">
                      {employee.recent_activity.map((activity, index) => (
                        <Link key={index} href={activity.link} className="flex items-center gap-4 p-3 bg-[var(--bg-slate)] rounded-lg hover:bg-[var(--bg-obsidian)] transition-colors">
                          <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                            activity.type === "post" ? "bg-blue-500/20 text-blue-400" :
                            activity.type === "event" ? "bg-purple-500/20 text-purple-400" :
                            "bg-green-500/20 text-green-400"
                          }`}>
                            {activity.type === "post" ? <FileText className="w-5 h-5" /> :
                             activity.type === "event" ? <Calendar className="w-5 h-5" /> :
                             <FileText className="w-5 h-5" />}
                          </div>
                          <div className="flex-1">
                            <p className="text-[var(--text-primary)] font-medium">{activity.title}</p>
                            <p className="text-[var(--text-muted)] text-sm capitalize">{activity.type} • {formatDate(activity.date)}</p>
                          </div>
                          <ChevronRight className="w-5 h-5 text-[var(--text-muted)]" />
                        </Link>
                      ))}
                    </div>
                  ) : (
                    <p className="text-[var(--text-muted)] text-center py-4">No recent platform activity</p>
                  )}
                </div>
              </FadeIn>

              {/* Cross-App Activity with Tabs */}
              <FadeIn delay={0.25}>
                <div className="bg-gradient-to-br from-purple-500/10 to-indigo-500/10 border border-purple-500/20 rounded-xl p-6 mb-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-[var(--text-primary)] flex items-center gap-2">
                      <Zap className="w-5 h-5 text-purple-400" /> Cross-App Activity
                    </h3>
                    {/* Activity Tabs */}
                    <div className="flex items-center gap-1 bg-white/5 rounded-lg p-0.5">
                      {[
                        { id: 'all', label: 'All', icon: '📊' },
                        { id: 'slack', label: 'Slack', icon: '💬', color: '#4A154B' },
                        { id: 'jira', label: 'Jira', icon: '📋', color: '#0052CC' },
                        { id: 'github', label: 'GitHub', icon: '🐙', color: '#24292e' },
                      ].map((tab) => (
                        <button
                          key={tab.id}
                          onClick={() => setActivityTab(tab.id as any)}
                          className={`px-3 py-1.5 text-xs rounded-md transition-colors flex items-center gap-1.5 ${
                            activityTab === tab.id
                              ? 'bg-purple-500/30 text-purple-300'
                              : 'text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-white/5'
                          }`}
                        >
                          <span>{tab.icon}</span>
                          <span>{tab.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                  {(() => {
                    const allActivity = getCrossAppActivity(employee.email);
                    const filteredActivity = activityTab === 'all'
                      ? allActivity
                      : allActivity.filter(a => a.source === activityTab);

                    if (filteredActivity.length > 0) {
                      return (
                        <div className="space-y-3">
                          {filteredActivity.slice(0, 5).map((activity: UnifiedActivity, index) => (
                            <div key={activity.id || index} className="flex items-center gap-4 p-3 bg-white/5 rounded-lg hover:bg-white/10 transition-colors">
                              <div className="w-10 h-10 rounded-lg bg-[var(--bg-slate)] flex items-center justify-center text-xl">
                                {SOURCE_ICONS[activity.source] || "📌"}
                              </div>
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                  <span className="text-xs px-2 py-0.5 rounded bg-purple-500/20 text-purple-300">
                                    {SOURCE_DISPLAY[activity.source]?.name || activity.source}
                                  </span>
                                </div>
                                <p className="text-[var(--text-primary)] font-medium text-sm">{activity.title}</p>
                                <p className="text-[var(--text-muted)] text-xs">
                                  {activity.createdAt ? new Date(activity.createdAt).toLocaleDateString() : ''}
                                </p>
                              </div>
                              {activity.target?.url && (
                                <a href={activity.target.url} target="_blank" rel="noopener noreferrer" className="p-2 hover:bg-white/10 rounded-lg transition-colors">
                                  <ExternalLink className="w-4 h-4 text-[var(--text-muted)]" />
                                </a>
                              )}
                            </div>
                          ))}
                        </div>
                      );
                    }
                    return (
                      <p className="text-[var(--text-muted)] text-center py-4">
                        No {activityTab === 'all' ? 'cross-app' : activityTab} activity found
                      </p>
                    );
                  })()}
                </div>
              </FadeIn>

              {/* Assigned Tasks from External Apps */}
              <FadeIn delay={0.3}>
                <div className="bg-[var(--bg-charcoal)] border border-[var(--border-subtle)] rounded-xl p-6">
                  <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-4 flex items-center gap-2">
                    <span className="text-xl">📋</span> Assigned Tasks
                  </h3>
                  {(() => {
                    const crossAppTasks = getCrossAppTasks(employee.email);
                    if (crossAppTasks.length > 0) {
                      return (
                        <div className="space-y-3">
                          {crossAppTasks.map((task: UnifiedTask, index) => (
                            <div key={task.id || index} className="flex items-center gap-4 p-3 bg-[var(--bg-slate)] rounded-lg hover:bg-[var(--bg-obsidian)] transition-colors">
                              <div className="w-10 h-10 rounded-lg bg-[var(--bg-obsidian)] flex items-center justify-center text-xl">
                                {SOURCE_ICONS[task.source] || "📌"}
                              </div>
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                  <span className="text-xs px-2 py-0.5 rounded bg-[var(--accent-ember)]/20 text-[var(--accent-ember)]">
                                    {SOURCE_DISPLAY[task.source]?.name || task.source}
                                  </span>
                                  <span className={`text-xs px-2 py-0.5 rounded ${
                                    task.priority === 'highest' || task.priority === 'urgent' ? 'bg-red-500/20 text-red-400' :
                                    task.priority === 'high' ? 'bg-orange-500/20 text-orange-400' :
                                    task.priority === 'medium' ? 'bg-yellow-500/20 text-yellow-400' :
                                    'bg-blue-500/20 text-blue-400'
                                  }`}>
                                    {task.priority}
                                  </span>
                                </div>
                                <p className="text-[var(--text-primary)] font-medium text-sm">{task.title}</p>
                                <p className="text-[var(--text-muted)] text-xs capitalize">
                                  {task.status?.replace('_', ' ')} {task.dueDate ? `• Due: ${new Date(task.dueDate).toLocaleDateString()}` : ''}
                                </p>
                              </div>
                              {task.url && (
                                <a href={task.url} target="_blank" rel="noopener noreferrer" className="p-2 hover:bg-white/10 rounded-lg transition-colors">
                                  <ExternalLink className="w-4 h-4 text-[var(--text-muted)]" />
                                </a>
                              )}
                            </div>
                          ))}
                        </div>
                      );
                    }
                    return (
                      <p className="text-[var(--text-muted)] text-center py-4">No assigned external tasks found</p>
                    );
                  })()}
                </div>
              </FadeIn>

              {/* Zoom Schedule */}
              <FadeIn delay={0.35}>
                <div className="bg-gradient-to-br from-[#2D8CFF]/10 to-[#0b5cff]/10 border border-[#2D8CFF]/20 rounded-xl p-6">
                  <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-4 flex items-center gap-2">
                    <Video className="w-5 h-5 text-[#2D8CFF]" /> Zoom Schedule
                  </h3>
                  {(() => {
                    const zoomSchedule = getZoomSchedule(employee.full_name);
                    const hasSchedule = zoomSchedule.live.length > 0 || zoomSchedule.upcoming.length > 0;

                    if (hasSchedule) {
                      return (
                        <div className="space-y-3">
                          {/* Live Meetings */}
                          {zoomSchedule.live.length > 0 && (
                            <div className="mb-4">
                              <div className="flex items-center gap-2 mb-2">
                                <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                                <span className="text-xs font-medium text-red-400">LIVE NOW</span>
                              </div>
                              {zoomSchedule.live.map((meeting, index) => (
                                <div key={meeting.id || index} className="flex items-center gap-4 p-3 bg-red-500/10 rounded-lg border border-red-500/30">
                                  <div className="w-10 h-10 rounded-lg bg-red-500/20 flex items-center justify-center">
                                    <Video className="w-5 h-5 text-red-400" />
                                  </div>
                                  <div className="flex-1">
                                    <p className="text-[var(--text-primary)] font-medium text-sm">{meeting.title}</p>
                                    <p className="text-[var(--text-muted)] text-xs">
                                      Started {meeting.startTime ? new Date(meeting.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'just now'}
                                    </p>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}

                          {/* Upcoming Meetings */}
                          {zoomSchedule.upcoming.length > 0 && (
                            <>
                              <div className="flex items-center gap-2 mb-2">
                                <Clock className="w-4 h-4 text-[#2D8CFF]" />
                                <span className="text-xs font-medium text-[#2D8CFF]">UPCOMING</span>
                              </div>
                              {zoomSchedule.upcoming.map((meeting, index) => (
                                <div key={meeting.id || index} className="flex items-center gap-4 p-3 bg-white/5 rounded-lg hover:bg-white/10 transition-colors">
                                  <div className="w-10 h-10 rounded-lg bg-[#2D8CFF]/20 flex items-center justify-center">
                                    <Video className="w-5 h-5 text-[#2D8CFF]" />
                                  </div>
                                  <div className="flex-1">
                                    <p className="text-[var(--text-primary)] font-medium text-sm">{meeting.title}</p>
                                    <p className="text-[var(--text-muted)] text-xs">
                                      {meeting.startTime ? new Date(meeting.startTime).toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' }) : ''} at {meeting.startTime ? new Date(meeting.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                                    </p>
                                  </div>
                                  {meeting.url && (
                                    <a href={meeting.url} target="_blank" rel="noopener noreferrer" className="px-3 py-1.5 rounded-lg bg-[#2D8CFF]/20 text-[#2D8CFF] text-xs font-medium hover:bg-[#2D8CFF]/30 transition-colors">
                                      Join
                                    </a>
                                  )}
                                </div>
                              ))}
                            </>
                          )}
                        </div>
                      );
                    }
                    return (
                      <p className="text-[var(--text-muted)] text-center py-4">No upcoming Zoom meetings</p>
                    );
                  })()}
                </div>
              </FadeIn>
            </>
          )}
        </div>
      </main>
    </div>
  );
}
