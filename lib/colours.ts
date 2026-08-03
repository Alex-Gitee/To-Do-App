const topicColors = ['#2F6F5E', '#B0402A', '#4A5B8C', '#8A6D3B', '#6B4A8C'];

function colorForTopic(topic: string) {
  const hash = topic.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0);
  return topicColors[hash % topicColors.length];
}