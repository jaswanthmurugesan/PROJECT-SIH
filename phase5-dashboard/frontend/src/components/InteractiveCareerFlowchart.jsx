import React, { useEffect, useRef, useState } from 'react'
import * as d3 from 'd3'

const InteractiveCareerFlowchart = ({ pathway, onModuleClick }) => {
  const svgRef = useRef()
  const [selectedModule, setSelectedModule] = useState(null)
  const [dimensions, setDimensions] = useState({ width: 1400, height: 1000 })

  useEffect(() => {
    if (!pathway || !pathway.modules) return

    const svg = d3.select(svgRef.current)
    svg.selectAll("*").remove() // Clear previous render

    // Set up dimensions
    const margin = { top: 60, right: 60, bottom: 60, left: 60 }
    const width = dimensions.width - margin.left - margin.right
    const height = dimensions.height - margin.top - margin.bottom

    // Create main group
    const g = svg
      .attr("width", dimensions.width)
      .attr("height", dimensions.height)
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`)

    // Prepare data with positions for flowchart layout - Better spacing and skill-based grouping
    const modules = pathway.modules.map((module, index) => {
      // Create skill-based grouping layout with much more spacing
      const skillGroups = {
        'entry': { col: 0, maxPerCol: 3, color: '#3B82F6' },
        'mid': { col: 1, maxPerCol: 4, color: '#10B981' },
        'senior': { col: 2, maxPerCol: 3, color: '#8B5CF6' },
        'leadership': { col: 3, maxPerCol: 2, color: '#F59E0B' }
      }

      const skillGroup = module.skillGroup || 'entry'
      const groupInfo = skillGroups[skillGroup]
      const indexInGroup = pathway.modules.filter(m => (m.skillGroup || 'entry') === skillGroup).indexOf(module)
      
      return {
        ...module,
        // Much improved spacing: more horizontal and vertical space to prevent text collision
        x: groupInfo.col * (width / 3.0) + 150, // Increased horizontal spacing
        y: (indexInGroup * 280) + 150, // Significantly increased vertical spacing for text
        id: module.module_id,
        status: module.status || 'pending',
        skillGroup: skillGroup,
        groupColor: groupInfo.color
      }
    })

    // Add skill group headers for better organization
    const skillGroupHeaders = [
      { name: "Entry Level", x: 150, color: "#3B82F6" },
      { name: "Mid Level", x: 150 + (width / 3.0), color: "#10B981" },
      { name: "Senior Level", x: 150 + (width / 3.0) * 2, color: "#8B5CF6" },
      { name: "Leadership", x: 150 + (width / 3.0) * 3, color: "#F59E0B" }
    ]

    const headers = g.selectAll(".skill-header")
      .data(skillGroupHeaders)
      .join("g")
      .attr("class", "skill-header")
      .attr("transform", d => `translate(${d.x}, 20)`)

    // Simple header titles - cleaner look
    headers.append("text")
      .attr("text-anchor", "middle")
      .attr("dy", "0em")
      .attr("font-size", "16px")
      .attr("font-weight", "700")
      .attr("fill", d => d.color)
      .text(d => d.name)

    // Create connections between modules (sequential flow)
    const links = []
    for (let i = 0; i < modules.length - 1; i++) {
      links.push({
        source: modules[i],
        target: modules[i + 1],
        type: 'sequential'
      })
    }

    // Add some dependency links for more complex flow
    if (modules.length > 3) {
      // Add some cross-connections for prerequisites
      links.push({
        source: modules[0],
        target: modules[2],
        type: 'prerequisite'
      })
      if (modules.length > 4) {
        links.push({
          source: modules[1],
          target: modules[4],
          type: 'prerequisite'
        })
      }
    }

    // Color schemes for different job availability statuses
    const statusColors = {
      available: '#10B981', // Green - Jobs you can apply for now
      target: '#F59E0B', // Amber - Primary target role
      future: '#6B7280', // Gray - Future career goals
      locked: '#EF4444' // Red - Need more skills
    }

    // Create arrow markers for directed edges
    svg.append("defs").selectAll("marker")
      .data(['sequential', 'prerequisite'])
      .join("marker")
      .attr("id", d => `arrow-${d}`)
      .attr("viewBox", "0 -5 10 10")
      .attr("refX", 25)
      .attr("refY", 0)
      .attr("markerWidth", 8)
      .attr("markerHeight", 8)
      .attr("orient", "auto")
      .append("path")
      .attr("d", "M0,-5L10,0L0,5")
      .attr("fill", d => d === 'sequential' ? '#3B82F6' : '#8B5CF6')
      .attr("opacity", 0.7)

    // Draw connections with curves
    const linkPaths = g.selectAll(".link")
      .data(links)
      .join("path")
      .attr("class", "link")
      .attr("d", d => {
        const dx = d.target.x - d.source.x
        const dy = d.target.y - d.source.y
        const dr = Math.sqrt(dx * dx + dy * dy) * 0.3
        return `M${d.source.x},${d.source.y}A${dr},${dr} 0 0,1 ${d.target.x},${d.target.y}`
      })
      .attr("stroke", d => d.type === 'sequential' ? '#3B82F6' : '#8B5CF6')
      .attr("stroke-width", d => d.type === 'sequential' ? 3 : 2)
      .attr("stroke-dasharray", d => d.type === 'prerequisite' ? "5,5" : "none")
      .attr("fill", "none")
      .attr("opacity", 0.6)
      .attr("marker-end", d => `url(#arrow-${d.type})`)

    // Create module groups
    const moduleGroups = g.selectAll(".module")
      .data(modules)
      .join("g")
      .attr("class", "module")
      .attr("transform", d => `translate(${d.x},${d.y})`)
      .style("cursor", "pointer")

    // Add circular progress rings for each module - Larger and more prominent
    moduleGroups.append("circle")
      .attr("class", "progress-bg")
      .attr("r", 50) // Increased size for better visibility
      .attr("fill", "none")
      .attr("stroke", "#E5E7EB")
      .attr("stroke-width", 6) // Thicker stroke

    // Progress circle based on career readiness - More prominent
    moduleGroups.append("circle")
      .attr("class", "progress-circle")
      .attr("r", 50)
      .attr("fill", "none")
      .attr("stroke", d => d.groupColor || statusColors[d.status])
      .attr("stroke-width", 6)
      .attr("stroke-linecap", "round")
      .attr("stroke-dasharray", d => {
        const circumference = 2 * Math.PI * 50
        // Show career readiness based on status
        const readiness = d.status === 'available' ? 1.0 : 
                         d.status === 'target' ? 0.7 : 
                         d.status === 'future' ? 0.3 : 0.1
        return `${circumference * readiness} ${circumference}`
      })
      .attr("transform", "rotate(-90)")
      .style("transition", "stroke-dasharray 0.5s ease")

    // Main module circles - Larger and more appealing
    moduleGroups.append("circle")
      .attr("class", "module-circle")
      .attr("r", 42) // Increased size
      .attr("fill", d => d.groupColor || statusColors[d.status])
      .attr("stroke", "#ffffff")
      .attr("stroke-width", 4)
      .style("filter", "drop-shadow(0 6px 12px rgba(0,0,0,0.15))")

    // Status icons in the center of modules - Larger and clearer
    moduleGroups.append("text")
      .attr("class", "status-icon")
      .attr("text-anchor", "middle")
      .attr("dy", "0.35em")
      .attr("font-size", "20px") // Larger icons
      .attr("fill", "white")
      .attr("font-weight", "bold")
      .text(d => {
        switch (d.status) {
          case 'available': return '✓'
          case 'target': return '⭐'
          case 'future': return '🎯'
          case 'locked': return '🔒'
          default: return '○'
        }
      })

    // Module titles - Cleaner and more compact
    moduleGroups.append("text")
      .attr("class", "module-title")
      .attr("text-anchor", "middle")
      .attr("dy", "80px") // Closer to circle
      .attr("font-size", "14px")
      .attr("font-weight", "700")
      .attr("fill", "#1F2937")
      .text(d => d.title) // Use the shortened titles directly

    // Salary display for all jobs
    moduleGroups.filter(d => d.salary)
      .append("text")
      .attr("class", "module-salary")
      .attr("text-anchor", "middle")
      .attr("dy", "100px") // Just below title
      .attr("font-size", "12px")
      .attr("font-weight", "600")
      .attr("fill", "#059669")
      .text(d => d.salary)

    // Add job requirements indicator
    moduleGroups.append("text")
      .attr("class", "module-requirements")
      .attr("text-anchor", "middle")
      .attr("dy", "115px") // Below the salary
      .attr("font-size", "10px")
      .attr("font-weight", "500")
      .attr("fill", "#6B7280")
      .text(d => {
        const statusText = {
          available: "Apply Now",
          target: "Primary Goal", 
          future: "Future Role",
          locked: "Need Skills"
        };
        return statusText[d.status] || "Available";
      })
      .text(d => `${d.score}% Complete`)

    // Add hover effects and interactions - Enhanced for better UX
    moduleGroups
      .on("mouseover", function(event, d) {
        // Enhanced hover effect with scaling
        d3.select(this)
          .select(".module-circle")
          .transition()
          .duration(300)
          .attr("r", 48) // Smooth scaling
          .style("filter", "drop-shadow(0 8px 16px rgba(0,0,0,0.25))")

        // Highlight title on hover
        d3.select(this)
          .select(".module-title")
          .transition()
          .duration(200)
          .attr("fill", "#1F2937")
          .attr("font-weight", "700")

        // Highlight connected paths
        linkPaths
          .style("opacity", link => 
            (link.source.id === d.id || link.target.id === d.id) ? 1 : 0.2
          )
          .style("stroke-width", link =>
            (link.source.id === d.id || link.target.id === d.id) ? 
            (link.type === 'sequential' ? 5 : 4) : 
            (link.type === 'sequential' ? 3 : 2)
          )

        // Show enhanced tooltip
        showTooltip(event, d)
      })
      .on("mouseout", function(event, d) {
        // Reset hover effects
        d3.select(this)
          .select(".module-circle")
          .transition()
          .duration(300)
          .attr("r", 42)
          .style("filter", "drop-shadow(0 6px 12px rgba(0,0,0,0.15))")

        // Reset title styling
        d3.select(this)
          .select(".module-title")
          .transition()
          .duration(200)
          .attr("fill", "#1F2937")
          .attr("font-weight", "600")

        // Reset path highlighting
        linkPaths
          .style("opacity", 0.6)
          .style("stroke-width", link => link.type === 'sequential' ? 3 : 2)

        hideTooltip()
      })
      .on("click", function(event, d) {
        setSelectedModule(d)
        if (onModuleClick) {
          onModuleClick(d)
        }
        
        // Enhanced selection highlighting
        moduleGroups.select(".module-circle")
          .attr("stroke", module => module.id === d.id ? "#1D4ED8" : "#ffffff")
          .attr("stroke-width", module => module.id === d.id ? 5 : 4)
          
        // Add selection ring
        moduleGroups.selectAll(".selection-ring").remove()
        d3.select(this)
          .append("circle")
          .attr("class", "selection-ring")
          .attr("r", 55)
          .attr("fill", "none")
          .attr("stroke", "#1D4ED8")
          .attr("stroke-width", 3)
          .attr("stroke-dasharray", "5,5")
          .style("opacity", 0.8)
      })

    // Tooltip functions
    const tooltip = d3.select("body").append("div")
      .attr("class", "d3-tooltip")
      .style("position", "absolute")
      .style("visibility", "hidden")
      .style("background", "rgba(0, 0, 0, 0.8)")
      .style("color", "white")
      .style("padding", "10px")
      .style("border-radius", "5px")
      .style("font-size", "12px")
      .style("pointer-events", "none")
      .style("z-index", "1000")

    function showTooltip(event, d) {
      tooltip.style("visibility", "visible")
        .html(`
          <strong>${d.title}</strong><br/>
          Status: ${d.status.replace('_', ' ').toUpperCase()}<br/>
          ${d.score ? `Progress: ${d.score}%<br/>` : ''}
          ${d.duration ? `Duration: ${d.duration}<br/>` : ''}
          ${d.description ? `<br/>${d.description}` : ''}
        `)
        .style("left", (event.pageX + 10) + "px")
        .style("top", (event.pageY - 10) + "px")
    }

    function hideTooltip() {
      tooltip.style("visibility", "hidden")
    }

    // Add zoom and pan functionality
    const zoom = d3.zoom()
      .scaleExtent([0.3, 3])
      .on("zoom", (event) => {
        g.attr("transform", event.transform)
      })

    svg.call(zoom)

    // Simple compact legend
    const legend = svg.append("g")
      .attr("class", "legend")
      .attr("transform", `translate(30, ${dimensions.height - 100})`)

    const legendData = [
      { label: "✓ Apply Now", color: statusColors.available },
      { label: "⭐ Target Role", color: statusColors.target },
      { label: "🎯 Future Goal", color: statusColors.future }
    ]

    const legendItems = legend.selectAll(".legend-item")
      .data(legendData)
      .join("g")
      .attr("class", "legend-item")
      .attr("transform", (d, i) => `translate(${i * 120}, 0)`)

    // Legend labels with icons
    legendItems.append("text")
      .attr("x", 0)
      .attr("dy", "0.35em")
      .attr("font-size", "12px")
      .attr("fill", d => d.color)
      .attr("font-weight", "600")
      .text(d => d.label)

    // Cleanup tooltip on unmount
    return () => {
      d3.select("body").selectAll(".d3-tooltip").remove()
    }

  }, [pathway, dimensions, selectedModule])

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      const container = svgRef.current?.parentElement
      if (container) {
        setDimensions({
          width: container.offsetWidth,
          height: Math.max(600, container.offsetHeight)
        })
      }
    }

    window.addEventListener('resize', handleResize)
    handleResize() // Initial call

    return () => window.removeEventListener('resize', handleResize)
  }, [])

  return (
    <div className="bg-white p-6 rounded-lg shadow-md mb-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-semibold text-gray-800">
          🎯 Interactive Career Path: {pathway?.title}
        </h3>
        <div className="flex items-center space-x-4 text-sm text-gray-600">
          <span>🖱️ Click modules for details</span>
          <span>🔍 Scroll to zoom</span>
          <span>✋ Drag to pan</span>
        </div>
      </div>
      
      <div className="relative overflow-hidden rounded-lg border border-gray-200 bg-gray-50">
        <svg ref={svgRef} className="w-full" style={{ minHeight: '800px', height: 'auto' }}></svg>
      </div>
      
      {selectedModule && (
        <div className="mt-6 p-6 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-xl font-bold text-blue-900 flex items-center">
              <span className="text-2xl mr-3">
                {selectedModule.status === 'completed' ? '✅' :
                 selectedModule.status === 'in_progress' ? '🎯' : '�'}
              </span>
              {selectedModule.title}
            </h4>
            <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
              selectedModule.skillGroup === 'foundation' ? 'bg-blue-100 text-blue-800' :
              selectedModule.skillGroup === 'core' ? 'bg-green-100 text-green-800' :
              selectedModule.skillGroup === 'advanced' ? 'bg-purple-100 text-purple-800' :
              'bg-yellow-100 text-yellow-800'
            }`}>
              {selectedModule.skillGroup?.charAt(0).toUpperCase() + selectedModule.skillGroup?.slice(1)} Skills
            </span>
          </div>
          
          <p className="text-gray-700 mb-4 text-lg leading-relaxed">{selectedModule.description}</p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <div className="bg-white p-4 rounded-lg shadow-sm">
              <div className="flex items-center mb-2">
                <span className="text-2xl mr-2">📊</span>
                <span className="font-semibold text-gray-700">Progress Status</span>
              </div>
              <div className={`text-lg font-bold ${
                selectedModule.status === 'completed' ? 'text-green-600' :
                selectedModule.status === 'in_progress' ? 'text-yellow-600' :
                'text-gray-500'
              }`}>
                {selectedModule.status === 'completed' ? 'Completed' :
                 selectedModule.status === 'in_progress' ? 'In Progress' : 'Ready to Start'}
              </div>
              {selectedModule.score > 0 && (
                <div className="text-sm text-gray-600 mt-1">
                  {selectedModule.score}% Complete
                </div>
              )}
            </div>
            
            <div className="bg-white p-4 rounded-lg shadow-sm">
              <div className="flex items-center mb-2">
                <span className="text-2xl mr-2">⏰</span>
                <span className="font-semibold text-gray-700">Time Investment</span>
              </div>
              <div className="text-lg font-bold text-indigo-600">
                {selectedModule.duration}
              </div>
              <div className="text-sm text-gray-600 mt-1">
                Estimated Duration
              </div>
            </div>
            
            <div className="bg-white p-4 rounded-lg shadow-sm">
              <div className="flex items-center mb-2">
                <span className="text-2xl mr-2">🎯</span>
                <span className="font-semibold text-gray-700">Skill Level</span>
              </div>
              <div className={`text-lg font-bold ${
                selectedModule.skillGroup === 'foundation' ? 'text-blue-600' :
                selectedModule.skillGroup === 'core' ? 'text-green-600' :
                selectedModule.skillGroup === 'advanced' ? 'text-purple-600' :
                'text-yellow-600'
              }`}>
                {selectedModule.skillGroup === 'foundation' ? 'Beginner' :
                 selectedModule.skillGroup === 'core' ? 'Intermediate' :
                 selectedModule.skillGroup === 'advanced' ? 'Advanced' : 'Expert'}
              </div>
              <div className="text-sm text-gray-600 mt-1">
                Difficulty Level
              </div>
            </div>
          </div>
          
          <div className="flex flex-wrap gap-3">
            {selectedModule.status === 'in_progress' && (
              <button className="flex items-center px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-semibold">
                <span className="mr-2">▶️</span>
                Continue Learning
              </button>
            )}
            {selectedModule.status === 'pending' && (
              <button className="flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold">
                <span className="mr-2">🚀</span>
                Start This Skill
              </button>
            )}
            {selectedModule.status === 'completed' && (
              <button className="flex items-center px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-semibold">
                <span className="mr-2">📚</span>
                Review & Practice
              </button>
            )}
            <button className="flex items-center px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-semibold border">
              <span className="mr-2">🔗</span>
              View Learning Resources
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default InteractiveCareerFlowchart