const { JSDOM } = require('jsdom');

const generateDynamicFlowData = (
  flowData, 
  externalInstructions,
) => {
  const output = [];
  const nodeMap = new Map();
  let count = 0;

  if (!flowData)  return output;

  flowData.nodes?.forEach((node) => {
    nodeMap.set(node.id, node);
  })

  const handleDynamicFollowUp = (field, value, type) => {
    try {
      const requiredFields = field === "replay" && [...new JSDOM(value).window.document.body.innerHTML.match(/\[(.*?)\]/g)]
        .map(v => v.slice(1, -1));
   
      const cleanedValue = field === "messages" && value.replace(/<[^>]+>/g, "").trim();
      const instructions = {
        messages: "Required Action: Start the conversation and introduce the assistant for all Querys.",
        replay: `Follow-up Action: Collect the [${requiredFields}]. If any required field is missing, prompt the user for it again without resetting previously collected data`,
      };
    
      const validation = {
        Text: `Required Field: [${requiredFields}]`,
        number: "Number",
        image: "Image URL",
        video: "Video URL",
      };
    
      if (!instructions[field]) return null;
    
      const validated = validation[type] || "Unknown Type";
      switch (field) {
        case "messages":
          return `
            - Query: 
              - Start with or Ask with:${cleanedValue} 
              - ${instructions[field]}`;
        case "replay":
          return `
            - ${instructions[field]} **${validated}**`;
        default:
          return null;
      }

      } catch (error) {
        console.error("Error:", error.message);
      }
    };
  
  const integrateExternalInstructions = (instructions) =>
    instructions.map((instr) => `- ${instr.text}`);

  const processNode = (nodeId, visited = new Set()) => {
    count++;
    if (visited.has(nodeId)) return;
    visited.add(nodeId);
    const node = nodeMap.get(nodeId);
    if (!node) return;
    const instructions = [];
    node.data.inputs.forEach((input) => {
      const instruction = handleDynamicFollowUp(input.field, input.value, input.type);
      if (instruction) {
        instructions.push(instruction);
      }
    });

    output.push({
      section: `Step ${count}`,
      instructions,
    });

    flowData.edges.forEach((edge) => {
      if (edge.source === node.id) {
        const targetNode = flowData
        .nodes.find((node) => node.id === edge.target)
        if (targetNode) {
          processNode(targetNode.id, visited);
        }
      }
    });
  };

  const rootNode = flowData.nodes && flowData.nodes[0]; 
  if (rootNode) {
    processNode(rootNode.id);
  }

  output.push(
    {
      section: "Domain-Specific Actions",
      instructions: [
      "- Identify specific domain-related actions based on the user's input.",
      '- Dynamically route queries like "Check availability", "Provide options", or "Resolve issues".',
      ],
    },
    {
      section: "Resolve and Conclude",
      instructions: [
      '- Ensure: "All queries and actions are completed satisfactorily."',
      '- Provide summary: "Here’s the summary of our interaction: [Summary details]"',
      '- Conclude politely: "Thank you for using our service. Have a great day!"',
      ],
    },
    {
      section: "General Guidelines",
      instructions: integrateExternalInstructions(externalInstructions),
    }
  );
  console.log(output,'outputoutput')
  return output;
}

module.exports = generateDynamicFlowData;
