// Recharts Data Visualization Component for MindSphere 3D
// Visualizes the player's 'Intelligence Points' trend over their last 10 levels played

class IntelligenceAnalytics {
  constructor() {
    this.root = null;
    this.containerId = "intelligence-chart-root";
  }

  renderChart() {
    const container = document.getElementById(this.containerId);
    if (!container) return;

    const data = SaveSys.getRecentIntelligenceData();
    const lang = getCurrentLanguage();
    const isRtl = lang === "ar";

    // Summary calculations
    const scores = data.map(d => d.score);
    const peak = scores.length > 0 ? Math.max(...scores) : 0;
    const avg = scores.length > 0 ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 0;
    const totalMoves = data.reduce((a, b) => a + (b.moves || 0), 0);

    // Update Summary KPI Cards
    const peakEl = document.getElementById("analytics-peak-score");
    const avgEl = document.getElementById("analytics-avg-score");
    const levelsEl = document.getElementById("analytics-levels-count");
    if (peakEl) peakEl.textContent = peak;
    if (avgEl) avgEl.textContent = avg;
    if (levelsEl) levelsEl.textContent = `${data.length}/10`;

    // Attempt rendering using Recharts library
    if (window.React && window.ReactDOM && window.Recharts) {
      try {
        this.renderWithRecharts(container, data, isRtl);
        return;
      } catch (err) {
        console.warn("Recharts rendering fallback to SVG:", err);
      }
    }

    // Failsafe custom SVG chart if Recharts library failed to initialize
    this.renderWithSVG(container, data, isRtl);
  }

  renderWithRecharts(container, data, isRtl) {
    const React = window.React;
    const ReactDOM = window.ReactDOM;
    const {
      ResponsiveContainer,
      AreaChart,
      Area,
      XAxis,
      YAxis,
      Tooltip,
      CartesianGrid
    } = window.Recharts;

    const formattedData = data.map((d, index) => ({
      name: isRtl ? `غرفة ${d.level}` : `Lvl ${d.level}`,
      score: d.score,
      time: `${d.time || 0}s`,
      moves: d.moves || 0,
      index: index + 1
    }));

    // Custom Tooltip component in React
    const CustomTooltip = ({ active, payload, label }) => {
      if (active && payload && payload.length) {
        const item = payload[0].payload;
        return React.createElement(
          "div",
          {
            style: {
              background: "rgba(14, 21, 38, 0.95)",
              border: "1px solid #00f2fe",
              borderRadius: "10px",
              padding: "8px 12px",
              boxShadow: "0 0 16px rgba(0, 242, 254, 0.4)",
              color: "#fff",
              fontSize: "12px",
              textAlign: isRtl ? "right" : "left",
              direction: isRtl ? "rtl" : "ltr"
            }
          },
          React.createElement("div", { style: { fontWeight: "bold", color: "#00f2fe", marginBottom: "4px" } }, label),
          React.createElement("div", null, `${isRtl ? "نقاط الذكاء" : "Intelligence Points"}: `, React.createElement("strong", { style: { color: "#ffb703" } }, item.score)),
          React.createElement("div", { style: { color: "#94a3b8", fontSize: "11px", marginTop: "2px" } }, `${isRtl ? "الزمن" : "Time"}: ${item.time} • ${isRtl ? "الحركات" : "Actions"}: ${item.moves}`)
        );
      }
      return null;
    };

    // Main Chart Element
    const chartElement = React.createElement(
      "div",
      { style: { width: "100%", height: 230 } },
      React.createElement(
        ResponsiveContainer,
        { width: "100%", height: "100%" },
        React.createElement(
          AreaChart,
          { data: formattedData, margin: { top: 10, right: 15, left: -20, bottom: 0 } },
          React.createElement("defs", null,
            React.createElement("linearGradient", { id: "intelGrad", x1: "0", y1: "0", x2: "0", y2: "1" },
              React.createElement("stop", { offset: "5%", stopColor: "#00f2fe", stopOpacity: 0.55 }),
              React.createElement("stop", { offset: "95%", stopColor: "#9d4edd", stopOpacity: 0.02 })
            )
          ),
          React.createElement(CartesianGrid, { strokeDasharray: "3 3", stroke: "rgba(255, 255, 255, 0.08)", vertical: false }),
          React.createElement(XAxis, { dataKey: "name", stroke: "#94a3b8", fontSize: 11, tickLine: false, axisLine: { stroke: "rgba(255, 255, 255, 0.15)" } }),
          React.createElement(YAxis, { stroke: "#94a3b8", fontSize: 11, tickLine: false, axisLine: false, domain: ["dataMin - 100", "dataMax + 100"] }),
          React.createElement(Tooltip, { content: React.createElement(CustomTooltip) }),
          React.createElement(Area, {
            type: "monotone",
            dataKey: "score",
            stroke: "#00f2fe",
            strokeWidth: 3,
            fillOpacity: 1,
            fill: "url(#intelGrad)",
            activeDot: { r: 6, fill: "#ffb703", stroke: "#fff", strokeWidth: 2, boxShadow: "0 0 10px #ffb703" },
            dot: { r: 3.5, fill: "#00f2fe", stroke: "#060913", strokeWidth: 1.5 }
          })
        )
      )
    );

    if (ReactDOM.createRoot) {
      if (!this.root) {
        this.root = ReactDOM.createRoot(container);
      }
      this.root.render(chartElement);
    } else if (ReactDOM.render) {
      ReactDOM.render(chartElement, container);
    }
  }

  renderWithSVG(container, data, isRtl) {
    const w = container.clientWidth || 340;
    const h = 210;
    const padding = { top: 20, right: 20, bottom: 30, left: 35 };

    const scores = data.map(d => d.score);
    const min = Math.max(0, Math.min(...scores) - 100);
    const max = Math.max(...scores) + 100;
    const range = max - min || 1;

    const plotW = w - padding.left - padding.right;
    const plotH = h - padding.top - padding.bottom;

    const points = data.map((d, i) => {
      const x = padding.left + (i / Math.max(data.length - 1, 1)) * plotW;
      const y = padding.top + plotH - ((d.score - min) / range) * plotH;
      return { x, y, score: d.score, level: d.level };
    });

    const pathD = points.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ");
    const areaD = `${pathD} L ${points[points.length - 1].x} ${padding.top + plotH} L ${points[0].x} ${padding.top + plotH} Z`;

    let dotsSvg = points.map(p => `
      <circle cx="${p.x}" cy="${p.y}" r="4" fill="#00f2fe" stroke="#060913" stroke-width="2" />
      <text x="${p.x}" y="${p.y - 8}" fill="#94a3b8" font-size="10" text-anchor="middle">${p.score}</text>
    `).join("");

    let xLabels = points.map(p => `
      <text x="${p.x}" y="${h - 10}" fill="#94a3b8" font-size="10" text-anchor="middle">L${p.level}</text>
    `).join("");

    container.innerHTML = `
      <svg width="${w}" height="${h}" style="width:100%; height:auto;">
        <defs>
          <linearGradient id="svgGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stop-color="#00f2fe" stop-opacity="0.5"/>
            <stop offset="100%" stop-color="#9d4edd" stop-opacity="0.05"/>
          </linearGradient>
        </defs>
        <line x1="${padding.left}" y1="${padding.top + plotH}" x2="${w - padding.right}" y2="${padding.top + plotH}" stroke="rgba(255,255,255,0.1)"/>
        <line x1="${padding.left}" y1="${padding.top}" x2="${w - padding.right}" y2="${padding.top}" stroke="rgba(255,255,255,0.05)"/>
        <path d="${areaD}" fill="url(#svgGrad)" />
        <path d="${pathD}" fill="none" stroke="#00f2fe" stroke-width="3" />
        ${dotsSvg}
        ${xLabels}
      </svg>
    `;
  }
}

window.IntelligenceChart = new IntelligenceAnalytics();
