import { NavigationNode, MapMarker } from '@/types/map';

interface NodeWithDistance {
  node: NavigationNode;
  distance: number;
  previous: string | null;
}

// Find the closest navigation node to a marker
export function findClosestNode(
  marker: MapMarker,
  nodes: NavigationNode[]
): NavigationNode | null {
  if (nodes.length === 0) return null;

  const markerCenterX = marker.x + marker.width / 2;
  const markerCenterY = marker.y + marker.height / 2;

  let closest: NavigationNode | null = null;
  let minDistance = Infinity;

  for (const node of nodes) {
    const dx = node.x - markerCenterX;
    const dy = node.y - markerCenterY;
    const distance = Math.sqrt(dx * dx + dy * dy);
    
    if (distance < minDistance) {
      minDistance = distance;
      closest = node;
    }
  }

  return closest;
}

// Dijkstra's algorithm for finding shortest path
export function findPath(
  startNodeId: string,
  endNodeId: string,
  nodes: NavigationNode[]
): string[] {
  if (startNodeId === endNodeId) return [startNodeId];

  const nodeMap = new Map<string, NavigationNode>();
  nodes.forEach(n => nodeMap.set(n.id, n));

  const distances = new Map<string, NodeWithDistance>();
  const unvisited = new Set<string>();

  // Initialize
  nodes.forEach(node => {
    distances.set(node.id, {
      node,
      distance: node.id === startNodeId ? 0 : Infinity,
      previous: null,
    });
    unvisited.add(node.id);
  });

  while (unvisited.size > 0) {
    // Get unvisited node with smallest distance
    let currentId: string | null = null;
    let minDist = Infinity;
    
    for (const id of unvisited) {
      const dist = distances.get(id)?.distance ?? Infinity;
      if (dist < minDist) {
        minDist = dist;
        currentId = id;
      }
    }

    if (currentId === null || minDist === Infinity) break;
    if (currentId === endNodeId) break;

    unvisited.delete(currentId);
    const currentNode = nodeMap.get(currentId);
    const currentData = distances.get(currentId);
    
    if (!currentNode || !currentData) continue;

    // Update neighbors
    for (const neighborId of currentNode.connections) {
      if (!unvisited.has(neighborId)) continue;
      
      const neighbor = nodeMap.get(neighborId);
      if (!neighbor) continue;

      const dx = neighbor.x - currentNode.x;
      const dy = neighbor.y - currentNode.y;
      const edgeDistance = Math.sqrt(dx * dx + dy * dy);
      const newDistance = currentData.distance + edgeDistance;

      const neighborData = distances.get(neighborId);
      if (neighborData && newDistance < neighborData.distance) {
        neighborData.distance = newDistance;
        neighborData.previous = currentId;
      }
    }
  }

  // Reconstruct path
  const path: string[] = [];
  let current: string | null = endNodeId;
  
  while (current) {
    path.unshift(current);
    current = distances.get(current)?.previous ?? null;
  }

  // Check if path is valid (starts at startNodeId)
  if (path[0] !== startNodeId) {
    return []; // No path found
  }

  return path;
}

// Calculate navigation path from kiosk to destination marker
export function calculateNavigationPath(
  kioskMarker: MapMarker | null,
  destinationMarker: MapMarker,
  nodes: NavigationNode[]
): string[] {
  if (!kioskMarker) return [];

  const hallNodes = nodes.filter(n => n.hallId === destinationMarker.hallId);
  
  const startNode = findClosestNode(kioskMarker, hallNodes);
  const endNode = findClosestNode(destinationMarker, hallNodes);

  if (!startNode || !endNode) return [];

  return findPath(startNode.id, endNode.id, hallNodes);
}
