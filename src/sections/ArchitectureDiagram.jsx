import { useState } from "react";
import Reveal from "../components/Reveal.jsx";
import {
  architectureConnections,
  architectureLayers,
  architectureNodeById,
  architectureNodes,
} from "../data/sandbox.js";

/* Fixed layout slots per node (viewBox 0..1000 x 0..560).
   Layer columns run left-to-right; nodes stack within a column. */
const SLOTS = {
  flutter: { x: 40, y: 120, w: 210 },
  admin: { x: 40, y: 300, w: 210 },
  fastapi: { x: 300, y: 120, w: 210 },
  firebase: { x: 300, y: 300, w: 210 },
  langgraph: { x: 560, y: 200, w: 210 },
  yolo: { x: 560, y: 30, w: 210 },
  sklearn: { x: 560, y: 370, w: 210 },
  fraud: { x: 560, y: 450, w: 210 },
  postgres: { x: 820, y: 200, w: 140 },
};

const NODE_H = 62;

/* One SVG edge per connection, drawn once (A<B keeps it single). */
const EDGES = (() => {
  const seen = new Set();
  const list = [];
  Object.entries(architectureConnections).forEach(([a, peers]) => {
    peers.forEach((b) => {
      const key = [a, b].sort().join("::");
      if (seen.has(key)) return;
      seen.add(key);
      list.push({ key, from: a, to: b });
    });
  });
  return list;
})();

function edgePath(from, to) {
  const a = SLOTS[from];
  const b = SLOTS[to];
  const ax = a.x + a.w;
  const ay = a.y + NODE_H / 2;
  const bx = b.x;
  const by = b.y + NODE_H / 2;

  // Vertical-only pairing inside the same column (LangGraph <-> agents).
  if (a.x === b.x) {
    const topFirst = a.y < b.y;
    const x = a.x + a.w / 2;
    const y1 = topFirst ? a.y + NODE_H : a.y;
    const y2 = topFirst ? b.y : b.y + NODE_H;
    return `M ${x} ${y1} L ${x} ${y2}`;
  }

  const midX = ax + (bx - ax) / 2;
  return `M ${ax} ${ay} C ${midX} ${ay}, ${midX} ${by}, ${bx} ${by}`;
}

function Node({ id, active, connected, dimmed, onSelect }) {
  const node = architectureNodeById[id];
  const slot = SLOTS[id];

  const tone = active
    ? "border-accent/60 bg-accent/[0.08] text-ink"
    : connected
      ? "border-accent/30 bg-surface text-ink"
      : dimmed
        ? "border-hairline bg-void/40 text-faint"
        : "border-hairline-strong bg-surface text-muted";

  return (
    <button
      type="button"
      onClick={() => onSelect(id)}
      aria-pressed={active}
      className={`arch-node absolute flex flex-col justify-center border px-3 py-2 text-left ${tone}`}
      style={{
        left: `${slot.x}px`,
        top: `${slot.y}px`,
        width: `${slot.w}px`,
        height: `${NODE_H}px`,
      }}
    >
      <span className="truncate text-[0.8125rem] font-medium leading-tight">
        {node.name}
      </span>
      <span className="label-caps mt-1 truncate text-[0.5625rem] opacity-80">
        {node.role ?? node.tech}
      </span>
    </button>
  );
}

export default function ArchitectureDiagram() {
  const [selected, setSelected] = useState(null);

  const peers = selected ? architectureConnections[selected] ?? [] : [];
  const activeSet = new Set(selected ? [selected, ...peers] : []);

  const isEdgeLit = (edge) =>
    selected !== null && edge.from === selected && peers.includes(edge.to);

  const isEdgeSoft = (edge) =>
    selected !== null &&
    !isEdgeLit(edge) &&
    (edge.from === selected || edge.to === selected);

  const selectedNode = selected ? architectureNodeById[selected] : null;

  return (
    <section id="architecture" className="border-t border-hairline bg-void">
      <div className="mx-auto max-w-6xl px-6 py-24 md:py-32">
        <div className="lg:grid lg:grid-cols-[20rem_1fr] lg:gap-20">
          <div className="lg:sticky lg:top-28 lg:self-start">
            <Reveal>
              <p className="label-caps text-accent">System Architecture</p>
              <h2 className="mt-5 text-3xl font-semibold tracking-tight text-balance text-ink sm:text-4xl">
                Four layers.
                <br />
                One orchestrator.
              </h2>
              <p className="mt-6 max-w-sm text-sm leading-relaxed text-muted">
                The full stack behind every listing — from the Flutter client
                through the LangGraph orchestrator down to PostgreSQL 15. Click
                any node to trace its data flow.
              </p>

              <div className="mt-8 border-t border-hairline pt-6">
                <p className="label-caps text-faint">
                  {selectedNode ? "Selected" : "How to explore"}
                </p>
                {selectedNode ? (
                  <div className="mt-3">
                    <p className="text-sm font-medium text-ink">
                      {selectedNode.name}
                    </p>
                    <p className="label-caps mt-1 text-accent">
                      {selectedNode.layer}
                    </p>
                    <p className="mt-3 text-xs leading-relaxed text-muted">
                      {selectedNode.blurb}
                    </p>
                    {peers.length > 0 && (
                      <p className="mt-3 text-xs leading-relaxed text-faint">
                        Connects to {peers.length} node
                        {peers.length > 1 ? "s" : ""} —{" "}
                        {peers
                          .map((p) => architectureNodeById[p].name)
                          .join(", ")}
                        .
                      </p>
                    )}
                    <button
                      type="button"
                      onClick={() => setSelected(null)}
                      className="mt-4 text-xs font-medium text-muted underline-offset-4 transition-colors duration-200 hover:text-ink hover:underline"
                    >
                      Clear selection
                    </button>
                  </div>
                ) : (
                  <p className="mt-3 text-xs leading-relaxed text-muted">
                    Select a node — try <span className="text-ink">LangGraph</span>{" "}
                    to illuminate all three agent pipelines and the database
                    write path.
                  </p>
                )}
              </div>
            </Reveal>
          </div>

          <Reveal delay={80} className="mt-14 lg:mt-0">
            {/* Desktop / tablet diagram */}
            <div className="relative overflow-x-auto">
              <div
                className="relative mx-auto hidden h-[560px] w-[1000px] md:block"
                role="group"
                aria-label="Interactive system architecture diagram"
              >
                <svg
                  viewBox="0 0 1000 560"
                  className="pointer-events-none absolute inset-0 h-full w-full"
                  aria-hidden="true"
                >
                  {EDGES.map((edge) => {
                    const lit = isEdgeLit(edge);
                    const soft = isEdgeSoft(edge);
                    return (
                      <path
                        key={edge.key}
                        d={edgePath(edge.from, edge.to)}
                        fill="none"
                        className="arch-connector"
                        stroke={
                          lit ? "#22d3ee" : soft ? "#22d3ee" : "#243044"
                        }
                        strokeOpacity={lit ? 1 : soft ? 0.35 : 0.55}
                        strokeWidth={lit ? 2 : soft ? 1.5 : 1}
                      />
                    );
                  })}
                </svg>

                {architectureLayers.map((layer, i) => (
                  <div
                    key={layer}
                    aria-hidden="true"
                    className="absolute top-2 label-caps text-faint"
                    style={{ left: `${40 + i * 260}px` }}
                  >
                    {layer}
                  </div>
                ))}

                {architectureNodes.map((node) => (
                  <Node
                    key={node.id}
                    id={node.id}
                    active={selected === node.id}
                    connected={selected !== null && peers.includes(node.id)}
                    dimmed={selected !== null && !activeSet.has(node.id)}
                    onSelect={(id) =>
                      setSelected((prev) => (prev === id ? null : id))
                    }
                  />
                ))}
              </div>
            </div>

            {/* Mobile / stacked view */}
            <div className="md:hidden">
              {architectureLayers.map((layer) => (
                <div key={layer} className="mb-8 last:mb-0">
                  <p className="label-caps border-b border-hairline pb-2 text-faint">
                    {layer}
                  </p>
                  <ul className="mt-2">
                    {architectureNodes
                      .filter((n) => n.layer === layer)
                      .map((node) => {
                        const active = selected === node.id;
                        const connected =
                          selected !== null && peers.includes(node.id);
                        const dimmed =
                          selected !== null && !activeSet.has(node.id);
                        return (
                          <li key={node.id}>
                            <button
                              type="button"
                              aria-pressed={active}
                              onClick={() =>
                                setSelected((prev) =>
                                  prev === node.id ? null : node.id
                                )
                              }
                              className={`arch-node flex w-full flex-col border-b border-hairline py-3 text-left ${
                                active
                                  ? "text-ink"
                                  : connected
                                    ? "text-ink"
                                    : dimmed
                                      ? "text-faint"
                                      : "text-muted"
                              }`}
                            >
                              <span className="text-sm font-medium">
                                {node.name}
                              </span>
                              <span className="label-caps mt-0.5 text-[0.5625rem] opacity-80">
                                {node.role ?? node.tech}
                              </span>
                            </button>
                          </li>
                        );
                      })}
                  </ul>
                </div>
              ))}

              {selectedNode && (
                <div className="detect-in border border-accent/30 bg-accent/[0.06] p-4">
                  <p className="text-sm font-medium text-ink">
                    {selectedNode.name}
                  </p>
                  <p className="label-caps mt-1 text-accent">
                    {selectedNode.layer}
                  </p>
                  <p className="mt-2 text-xs leading-relaxed text-muted">
                    {selectedNode.blurb}
                  </p>
                </div>
              )}
            </div>

            {/* Legend */}
            <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-3 border-t border-hairline pt-5">
              <span className="flex items-center gap-2 text-[0.6875rem] text-faint">
                <span className="h-px w-6 bg-hairline-strong" aria-hidden="true" />
                Inactive
              </span>
              <span className="flex items-center gap-2 text-[0.6875rem] text-muted">
                <span
                  className="h-px w-6 bg-accent/35"
                  aria-hidden="true"
                />
                Related
              </span>
              <span className="flex items-center gap-2 text-[0.6875rem] text-accent">
                <span className="h-0.5 w-6 bg-accent" aria-hidden="true" />
                Selected flow
              </span>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
