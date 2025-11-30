import { useEffect, useRef, useState } from "react";
import * as d3 from "d3";
import graphData from "@/mocks/graph";

export default function GenesGraphView() {
  const svgRef = useRef();
  const [selectedNode, setSelectedNode] = useState(null);

  useEffect(() => {
    const width = svgRef.current.clientWidth;
    const height = svgRef.current.clientHeight;

    // Limpa SVG antigo
    d3.select(svgRef.current).selectAll("*").remove();

    const svg = d3
      .select(svgRef.current)
      .attr("width", width)
      .attr("height", height);

    const simulation = d3
      .forceSimulation(graphData.nodes)
      .force(
        "link",
        d3
          .forceLink(graphData.edges)
          .id((d) => d.id)
          .distance(100)
      )
      .force("charge", d3.forceManyBody().strength(-300))
      .force("center", d3.forceCenter(width / 2, height / 2));

    const link = svg
      .append("g")
      .attr("stroke", "#999")
      .attr("stroke-opacity", 0.6)
      .selectAll("line")
      .data(graphData.edges)
      .join("line")
      .attr("stroke-width", (d) => d.weight);

    const node = svg
      .append("g")
      .selectAll("circle")
      .data(graphData.nodes)
      .join("circle")
      .attr("r", (d) => (d.type === "gene" ? 18 : 12))
      .attr("fill", (d) =>
        selectedNode && selectedNode.id === d.id
          ? "#fe615a"
          : d.type === "gene"
          ? "#1e3a8a"
          : "#6b7280"
      )
      .call(
        d3
          .drag()
          .on("start", (event, d) => {
            if (!event.active) simulation.alphaTarget(0.3).restart();
            d.fx = d.x;
            d.fy = d.y;
          })
          .on("drag", (event, d) => {
            d.fx = event.x;
            d.fy = event.y;
          })
          .on("end", (event, d) => {
            if (!event.active) simulation.alphaTarget(0);
            d.fx = null;
            d.fy = null;
          })
      )
      .on("click", (event, d) => {
        setSelectedNode(d);
      });

    const label = svg
      .append("g")
      .selectAll("text")
      .data(graphData.nodes)
      .join("text")
      .text((d) => d.label)
      .attr("font-size", 12)
      .attr("text-anchor", "middle")
      .attr("dy", 4)
      .attr("pointer-events", "none");

    simulation.on("tick", () => {
      link
        .attr("x1", (d) => d.source.x)
        .attr("y1", (d) => d.source.y)
        .attr("x2", (d) => d.target.x)
        .attr("y2", (d) => d.target.y);

      node.attr("cx", (d) => d.x).attr("cy", (d) => d.y);
      label.attr("x", (d) => d.x).attr("y", (d) => d.y);
    });

    return () => simulation.stop();
  }, [selectedNode]);

  return (
    <div className="flex w-full h-full">
      {/* Grafo */}
      <div className="flex-1 min-h-0 min-w-0">
        <svg ref={svgRef} className="w-full h-full" />
      </div>

      {/* Painel lateral */}
      <div className="w-64 border-l p-3 bg-white flex-shrink-0">
        {selectedNode ? (
          <>
            <h2 className="font-bold mb-2">{selectedNode.label}</h2>
            <p>Tipo: {selectedNode.type}</p>
            {/* Aqui você pode adicionar mais detalhes do node */}
          </>
        ) : (
          <p>Selecione um node para ver detalhes</p>
        )}
      </div>
    </div>
  );
}
