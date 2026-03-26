import React, { useState } from "react";
import axios from "axios";
import { AlertTriangle, Bot, ClipboardList, LineChart, Sparkles, Zap, LoaderCircle } from "lucide-react";
import "./App.css";

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL ?? "http://127.0.0.1:8000";
const HERO_IMAGE_URL =
  "https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=1600&q=80";

const tabs = [
  { key: "analyze", label: "Analyze", endpoint: "/analyze" },
  { key: "spend", label: "Spend Intelligence", endpoint: "/analyze" },
  { key: "optimize", label: "Resource Optimization", endpoint: "/smart-optimize" },
  { key: "sla", label: "SLA Guard", endpoint: "/sla-guard" },
  { key: "finance", label: "Financial Ops", endpoint: "/finance-ops" },
  { key: "logs", label: "Activity", endpoint: "/audit-logs" },
  { key: "impact", label: "Impact", endpoint: "/impact" },
  { key: "propose", label: "Action Queue", endpoint: "/propose-actions" },
];

const agentCategories = [
  {
    key: "analyze",
    eyebrow: "Overview",
    title: "Analyze",
    description: "See the full cost picture across spend leakage, infrastructure waste, and corrective action opportunities.",
    action: "Discover the overview",
    icon: LineChart,
  },
  {
    key: "spend",
    eyebrow: "Cost Agent",
    title: "Spend Intelligence",
    description: "Detect duplicate payments, vendor anomalies, and procurement leakage with clear financial exposure.",
    action: "Discover the spend agent",
    icon: ClipboardList,
  },
  {
    key: "optimize",
    eyebrow: "Cost Agent",
    title: "Resource Optimization",
    description: "Identify idle infrastructure, rank high-value waste, and prioritize shutdown or consolidation.",
    action: "Discover the resource agent",
    icon: Sparkles,
  },
  {
    key: "sla",
    eyebrow: "Control Agent",
    title: "SLA Guard",
    description: "Catch approaching breaches, escalate risk, and help prevent avoidable penalty costs.",
    action: "Discover the SLA agent",
    icon: AlertTriangle,
  },
  {
    key: "finance",
    eyebrow: "Control Agent",
    title: "Financial Ops",
    description: "Reconcile discrepancies, explain variance, and route the next finance action with confidence.",
    action: "Discover the finance agent",
    icon: Bot,
  },
  {
    key: "impact",
    eyebrow: "Executive View",
    title: "Impact",
    description: "Translate all detections into monthly and yearly business value for leadership teams.",
    action: "Discover the impact view",
    icon: Zap,
  },
];

const formatCurrency = (value = 0) =>
  new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 }).format(value);

const formatAgentLabel = (agent = "") =>
  agent
    .split("_")
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");

const getImpactLabel = (agent = "") => {
  if (agent === "resource") return "Estimated Waste";
  if (agent === "sla") return "Penalty Prevented";
  if (agent === "finance") return "Variance Identified";
  if (agent === "spend") return "Duplicate Payment Avoided";
  return "Estimated Impact";
};

function RecommendationCard({ title, subtitle, icon: Icon, value, accent = "gold" }) {
  return (
    <div className={`recommendation-card ${accent}`}>
      <div className="card-image">
        <div className="card-icon">
          <Icon size={48} />
        </div>
      </div>
      <div className="card-content">
        <h3>{title}</h3>
        <p className="subtitle">{subtitle}</p>
        <div className="card-value">{value}</div>
      </div>
    </div>
  );
}

function DetailCard({ title, items, accent = "neutral" }) {
  return (
    <div className={`luxury-detail-card ${accent}`}>
      <h3>{title}</h3>
      <div className="detail-items">
        {items.map((item, idx) => (
          <div key={idx} className="detail-item">
            <span className="detail-label">{item.label}</span>
            <span className="detail-value">{item.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function App() {
  const [activeTab, setActiveTab] = useState("analyze");
  const [data, setData] = useState(null);
  const [impact, setImpact] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showAgentShowcase, setShowAgentShowcase] = useState(false);
  const primaryTabs = tabs.filter((tab) => tab.key !== "propose");
  const actionQueueTab = tabs.find((tab) => tab.key === "propose");

  const handleTabClick = async (tab) => {
    setActiveTab(tab.key);
    setLoading(true);
    setError("");

    try {
      const res = await axios.get(`${API_BASE_URL}${tab.endpoint}`);
      if (tab.key === "impact") {
        setImpact(res.data);
        setData(null);
      } else {
        setData(res.data);
        setImpact(null);
      }
    } catch (err) {
      console.error(err);
      setError(`Unable to load ${tab.label.toLowerCase()} right now.`);
      setData(null);
      setImpact(null);
    } finally {
      setLoading(false);
    }
  };

  const openTabByKey = async (tabKey) => {
    const selectedTab = tabs.find((tab) => tab.key === tabKey);
    if (selectedTab) {
      await handleTabClick(selectedTab);
    }
  };

  const approveAction = async (actionId) => {
    try {
      await axios.post(`${API_BASE_URL}/approve/${actionId}`);
      const proposeTab = tabs.find((tab) => tab.key === "propose");
      await handleTabClick(proposeTab);
    } catch (err) {
      console.error(err);
      setError("Unable to approve the action right now.");
    }
  };

  const duplicateSavings =
    data?.summary?.duplicate_savings ??
    data?.duplicates?.reduce((total, item) => total + (item.amount || 0), 0) ??
    0;

  const resourceSavings =
    data?.summary?.resource_savings ??
    data?.idle_resources?.reduce((total, item) => total + (item.cost || 0), 0) ??
    0;

  const impactedVendors =
    data?.duplicates ? new Set(data.duplicates.map((item) => item.vendor)).size : 0;

  const renderAnalyzeView = () => (
    <>
      <div className="cards-grid">
        <RecommendationCard
          icon={Zap}
          title="Total Financial Impact"
          subtitle="Combined duplicate and resource opportunity"
          value={`Rs. ${formatCurrency(data?.summary?.total_savings)}`}
          accent="gold"
        />
        <RecommendationCard
          icon={ClipboardList}
          title="Duplicate Savings"
          subtitle="Recoverable duplicate payment exposure"
          value={`Rs. ${formatCurrency(duplicateSavings)}`}
          accent="rose"
        />
        <RecommendationCard
          icon={Bot}
          title="Resource Savings"
          subtitle="Monthly waste from idle infrastructure"
          value={`Rs. ${formatCurrency(resourceSavings)}`}
          accent="emerald"
        />
        <RecommendationCard
          icon={AlertTriangle}
          title="Issues Found"
          subtitle="Cost inefficiencies detected"
          value={data?.summary?.issues || 0}
          accent="amber"
        />
      </div>

      {data?.duplicates?.length > 0 && (
        <div className="luxury-section">
          <h2>Duplicate Payments</h2>
          <p className="section-subtitle">
            {data?.duplicates?.length} matches found with Rs. {formatCurrency(duplicateSavings)} exposure
          </p>
          <div className="detail-grid">
            {data.duplicates.map((item, idx) => (
              <DetailCard
                key={idx}
                title={item.vendor}
                items={[
                  { label: "Amount", value: `Rs. ${formatCurrency(item.amount)}` },
                  { label: "Date", value: item.date },
                ]}
                accent="danger"
              />
            ))}
          </div>
        </div>
      )}

      {data?.idle_resources?.length > 0 && (
        <div className="luxury-section">
          <h2>Idle Resources</h2>
          <p className="section-subtitle">
            {data?.idle_resources?.length} resources identified with Rs. {formatCurrency(resourceSavings)} monthly waste
          </p>
          <div className="detail-grid">
            {data.idle_resources.map((item) => (
              <DetailCard
                key={item.server_id}
                title={item.display_name || item.server_id}
                items={[
                  { label: "CPU Usage", value: `${item.cpu_usage}%` },
                  { label: "Monthly Cost", value: `Rs. ${formatCurrency(item.cost)}` },
                ]}
                accent="warning"
              />
            ))}
          </div>
        </div>
      )}
    </>
  );

  const renderOptimizeView = () => (
    <>
      <div className="cards-grid">
        <RecommendationCard
          icon={Sparkles}
          title="AI Savings"
          subtitle="AI-powered optimizations"
          value={`Rs. ${formatCurrency(data?.summary?.total_savings)}`}
          accent="gold"
        />
        <RecommendationCard
          icon={Bot}
          title="AI Actions"
          subtitle="Recommended optimizations"
          value={data?.summary?.actions || 0}
          accent="emerald"
        />
        <RecommendationCard
          icon={AlertTriangle}
          title="Issues Explained"
          subtitle="Detailed analysis available"
          value={data?.summary?.issues || 0}
          accent="amber"
        />
      </div>

      {data?.items?.length > 0 && (
        <div className="luxury-section">
          <h2>Optimization Recommendations</h2>
          <div className="detail-grid">
            {data.items.map((item, idx) => (
              <DetailCard
                key={idx}
                title={item.server}
                items={[
                  { label: "Action", value: item.action },
                  { label: "Priority", value: item.analysis?.priority || "Medium" },
                  { label: "Monthly Savings", value: `Rs. ${formatCurrency(item.saving)}` },
                ]}
                accent="neutral"
              />
            ))}
          </div>
        </div>
      )}
    </>
  );

  const renderSpendView = () => (
    <>
      <div className="cards-grid">
        <RecommendationCard
          icon={ClipboardList}
          title="Duplicate Exposure"
          subtitle="Recoverable value from duplicate patterns"
          value={`Rs. ${formatCurrency(duplicateSavings)}`}
          accent="rose"
        />
        <RecommendationCard
          icon={AlertTriangle}
          title="Duplicate Matches"
          subtitle="Duplicate payment issues detected"
          value={data?.duplicates?.length || 0}
          accent="gold"
        />
        <RecommendationCard
          icon={Bot}
          title="Vendors Impacted"
          subtitle="Suppliers requiring follow-up"
          value={impactedVendors}
          accent="emerald"
        />
      </div>

      {data?.duplicates?.length > 0 && (
        <div className="luxury-section">
          <h2>Spend Intelligence Cases</h2>
          <p className="section-subtitle">
            {data?.duplicates?.length} suspicious payments across {impactedVendors} vendors
          </p>
          <div className="detail-grid">
            {data.duplicates.map((item, idx) => (
              <DetailCard
                key={`${item.vendor}-${item.date}-${idx}`}
                title={item.vendor}
                items={[
                  { label: "Exposure", value: `Rs. ${formatCurrency(item.amount)}` },
                  { label: "Date", value: item.date },
                  { label: "Suggested Move", value: "Review and prevent duplicate settlement" },
                ]}
                accent="danger"
              />
            ))}
          </div>
        </div>
      )}
    </>
  );

  const renderSlaView = () => (
    <>
      <div className="cards-grid">
        <RecommendationCard
          icon={AlertTriangle}
          title="Tickets At Risk"
          subtitle="Potential SLA breaches detected"
          value={data?.summary?.tickets_at_risk || 0}
          accent="rose"
        />
        <RecommendationCard
          icon={LineChart}
          title="Penalty Exposure"
          subtitle="Potential penalty prevented"
          value={`Rs. ${formatCurrency(data?.summary?.penalty_exposure)}`}
          accent="gold"
        />
        <RecommendationCard
          icon={Bot}
          title="Recommended Actions"
          subtitle="Escalations and reroutes suggested"
          value={data?.items?.length || 0}
          accent="emerald"
        />
      </div>

      {data?.items?.length > 0 && (
        <div className="luxury-section">
          <h2>SLA Risk Tickets</h2>
          <p className="section-subtitle">{data?.items?.length} tickets need attention</p>
          <div className="detail-grid">
            {data.items.map((item, idx) => (
              <DetailCard
                key={idx}
                title={item.ticket_id}
                items={[
                  { label: "Service", value: item.service },
                  { label: "Priority", value: item.priority },
                  { label: "Status", value: item.status },
                  { label: "Risk", value: item.sla_breach_risk },
                  { label: "Penalty", value: `Rs. ${formatCurrency(item.penalty_cost)}` },
                  { label: "Action", value: item.recommended_action },
                ]}
                accent="danger"
              />
            ))}
          </div>
        </div>
      )}
    </>
  );

  const renderFinanceView = () => (
    <>
      <div className="cards-grid">
        <RecommendationCard
          icon={ClipboardList}
          title="Issues Found"
          subtitle="Finance discrepancies detected"
          value={data?.summary?.issues_found || 0}
          accent="rose"
        />
        <RecommendationCard
          icon={LineChart}
          title="Variance Exposure"
          subtitle="Total financial variance identified"
          value={`Rs. ${formatCurrency(data?.summary?.variance_exposure)}`}
          accent="gold"
        />
        <RecommendationCard
          icon={Bot}
          title="Recommended Actions"
          subtitle="Reconciliation actions suggested"
          value={data?.items?.length || 0}
          accent="emerald"
        />
      </div>

      {data?.items?.length > 0 && (
        <div className="luxury-section">
          <h2>Finance Reconciliation Issues</h2>
          <p className="section-subtitle">{data?.items?.length} records require review</p>
          <div className="detail-grid">
            {data.items.map((item, idx) => (
              <DetailCard
                key={idx}
                title={item.invoice_id}
                items={[
                  { label: "Vendor", value: item.vendor },
                  { label: "Status", value: item.status },
                  { label: "Expected", value: `Rs. ${formatCurrency(item.expected_amount)}` },
                  { label: "Actual", value: `Rs. ${formatCurrency(item.actual_amount)}` },
                  { label: "Variance", value: `Rs. ${formatCurrency(Math.abs(item.variance || 0))}` },
                  { label: "Cause", value: item.root_cause },
                  { label: "Action", value: item.recommended_action },
                ]}
                accent="danger"
              />
            ))}
          </div>
        </div>
      )}
    </>
  );

  const renderProposeView = () => (
    <>
      <div className="cards-grid">
        <RecommendationCard
          icon={ClipboardList}
          title="Proposals"
          subtitle="Actions awaiting approval"
          value={data?.summary?.proposals || 0}
          accent="gold"
        />
        <RecommendationCard
          icon={LineChart}
          title="Potential Savings"
          subtitle="Total optimization opportunity"
          value={`Rs. ${formatCurrency(data?.summary?.potential_savings)}`}
          accent="emerald"
        />
      </div>

      {data?.items?.length > 0 && (
        <div className="luxury-section">
          <h2>Pending Approvals</h2>
          <div className="proposals-grid">
            {data.items
              .filter(Boolean)
              .map((item, idx) => {
                const issue = item?.issue ?? item ?? {};
                const proposalStatus = item?.status || issue.status || "pending";
                const executionState = issue.execution_state || item?.execution_state;
                const proposalId = item?.id ?? idx;

                return (
              <div key={proposalId} className="proposal-card">
                <div className={`proposal-status ${proposalStatus}`}>{proposalStatus}</div>
                <div className="proposal-meta">
                  <span className="proposal-agent">{formatAgentLabel(issue.agent || "operations")}</span>
                  <span className={`proposal-priority ${issue.priority || "medium"}`}>
                    {issue.priority || "medium"}
                  </span>
                </div>
                <h3>{issue.entity || "Operational Action"}</h3>
                <div className="proposal-insights">
                  <div className="proposal-insight-card">
                    <span className="proposal-insight-label">Problem</span>
                    <p className="proposal-insight-text">{issue.problem || "Issue details unavailable."}</p>
                  </div>
                  <div className="proposal-insight-card">
                    <span className="proposal-insight-label">Impact</span>
                    <p className="proposal-insight-text">{issue.impact || "Impact details unavailable."}</p>
                  </div>
                  <div className="proposal-insight-card">
                    <span className="proposal-insight-label">{getImpactLabel(issue.agent)}</span>
                    <p className="proposal-insight-value">
                      Rs. {formatCurrency(issue.estimated_savings)}
                    </p>
                  </div>
                  <div className="proposal-insight-card">
                    <span className="proposal-insight-label">Recommended Action</span>
                    <p className="proposal-insight-text">
                      {issue.recommended_action || "Review this item and decide the next step."}
                    </p>
                  </div>
                </div>
                <div className="proposal-savings">
                  Rs. {formatCurrency(issue.estimated_savings)} estimated impact
                </div>
                <button
                  className="approve-btn"
                  onClick={() => approveAction(proposalId)}
                  disabled={proposalStatus === "approved" || executionState === "executed"}
                >
                  {proposalStatus === "approved" || executionState === "executed"
                    ? "Approved"
                    : "Approve"}
                </button>
              </div>
                );
              })}
          </div>
        </div>
      )}
    </>
  );

  const renderLogsView = () => (
    <>
      {data?.items?.length > 0 && (
        <div className="luxury-section">
          <h2>Activity Timeline</h2>
          <div className="timeline-container">
            {data.items.map((item, idx) => (
              <div key={idx} className="timeline-entry">
                <div className="timeline-marker" />
                <div className="timeline-content">
                  <h4>{item.event}</h4>
                  <p>{item.timestamp}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </>
  );

  const renderImpactView = () => (
    <>
      <div className="impact-hero">
        <h2>Financial Impact Analysis</h2>
        <div className="impact-cards">
          <div className="impact-card primary">
            <p className="impact-label">Monthly Savings</p>
            <h3>Rs. {formatCurrency(impact?.monthly_savings)}</h3>
          </div>
          <div className="impact-card secondary">
            <p className="impact-label">Yearly Opportunity</p>
            <h3>Rs. {formatCurrency(impact?.yearly_savings)}</h3>
          </div>
        </div>
      </div>

      <div className="cards-grid">
        <RecommendationCard
          icon={LineChart}
          title="Yearly Savings"
          subtitle="Annual opportunity"
          value={`Rs. ${formatCurrency(impact?.yearly_savings)}`}
          accent="gold"
        />
        <RecommendationCard
          icon={Bot}
          title="Projected Actions"
          subtitle="Automated optimizations"
          value={impact?.projected_actions || 0}
          accent="emerald"
        />
        <RecommendationCard
          icon={AlertTriangle}
          title="Issues Detected"
          subtitle="Cost waste signals"
          value={impact?.issues_detected || 0}
          accent="rose"
        />
      </div>
    </>
  );

  const renderContent = () => {
    if (loading) {
      return (
        <div className="loading-state">
          <LoaderCircle className="spin" size={32} />
          <p>Loading...</p>
        </div>
      );
    }

    if (error) {
      return (
        <div className="error-banner">
          <p>{error}</p>
        </div>
      );
    }

    if (activeTab === "impact") {
      return impact ? renderImpactView() : null;
    }

    if (!data) {
      return (
        <div className="empty-state">
          <p>Select a dashboard view to begin</p>
        </div>
      );
    }

    if (activeTab === "analyze") return renderAnalyzeView();
    if (activeTab === "spend") return renderSpendView();
    if (activeTab === "optimize") return renderOptimizeView();
    if (activeTab === "sla") return renderSlaView();
    if (activeTab === "finance") return renderFinanceView();
    if (activeTab === "propose") return renderProposeView();
    if (activeTab === "logs") return renderLogsView();

    return null;
  };
  

  return (
    <div className="luxury-app">
      <header className="luxury-header">
        <div className="header-top">
          <div className="brand-logos">
            <span className="brand-logo">COST</span>
            <span className="brand-divider">|</span>
            <span className="brand-logo">AI</span>
            <span className="brand-divider">|</span>
            <span className="brand-logo">OPTIMIZE</span>
          </div>
          <div className="optiqon-mark" aria-label="Optiqon Unlimited">
            <div className="optiqon-icon" aria-hidden="true">
              <span className="optiqon-bar left" />
              <span className="optiqon-bar right" />
              <span className="optiqon-dot left" />
              <span className="optiqon-dot right" />
            </div>
            <span className="optiqon-wordmark">Optiqon</span>
            <span className="optiqon-submark">unlimited</span>
          </div>
        </div>
      </header>

      <main className="luxury-main">
        <section
          className="luxury-hero hero-with-image"
          style={{ backgroundImage: `url(${HERO_IMAGE_URL})` }}
        >
          <div className="hero-overlay" />
          <div className="hero-content">
            <p className="hero-kicker">Autonomous Cost Intelligence</p>
            <h1>Our Recommendations.</h1>
            <p className="hero-description">
              Detect waste, understand impact, and turn cloud cost signals into
              confident AI-backed actions.
            </p>
            <div className="hero-actions">
              <button className="hero-btn hero-btn-primary" onClick={() => openTabByKey("analyze")}>
                Explore Agents
              </button>
              <button className="hero-btn hero-btn-secondary" onClick={() => openTabByKey("propose")}>
                Open Action Queue
              </button>
              <button
                className="hero-btn hero-btn-tertiary"
                onClick={() => setShowAgentShowcase((current) => !current)}
              >
                {showAgentShowcase ? "Hide Details" : "Learn More"}
              </button>
            </div>
          </div>
        </section>

        <section className="agent-intro">
          <p className="agent-intro-kicker">Enterprise Agent Suite</p>
          <h2>Cost control agents built for spend, infrastructure, service risk and finance.</h2>
          <p className="agent-intro-copy">
            Choose a specialist agent below to inspect the signal, quantify the impact, and move the organization toward action.
          </p>
        </section>

        {showAgentShowcase && (
          <section className="agent-showcase">
            <div className="agent-grid">
              {agentCategories.map((agent) => {
                return (
                  <button
                    key={agent.key}
                    className={`agent-card ${activeTab === agent.key ? "active" : ""}`}
                    onClick={() => openTabByKey(agent.key)}
                  >
                    <div className="agent-card-copy">
                      <span className="agent-card-eyebrow">{agent.eyebrow}</span>
                      <h3>{agent.title}</h3>
                      <p>{agent.description}</p>
                      <span className="agent-card-action">{agent.action}</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </section>
        )}

        <nav className="luxury-nav">
          <div className="nav-track">
            {primaryTabs.map((tab) => (
              <button
                key={tab.key}
                className={`nav-item ${activeTab === tab.key ? "active" : ""}`}
                onClick={() => handleTabClick(tab)}
              >
                {tab.label}
              </button>
            ))}
          </div>
          {actionQueueTab && (
            <button
              className={`nav-action-btn ${activeTab === actionQueueTab.key ? "active" : ""}`}
              onClick={() => handleTabClick(actionQueueTab)}
            >
              {actionQueueTab.label}
            </button>
          )}
        </nav>

        <section className="luxury-content">{renderContent()}</section>
      </main>
    </div>
  );
}

export default App;
