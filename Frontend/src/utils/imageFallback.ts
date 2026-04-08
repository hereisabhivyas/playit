export const getFallbackImage = (label: string, size = 120): string => {
  const safeLabel = label.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${size} ${size}">
      <rect width="100%" height="100%" rx="16" fill="#222" />
      <text
        x="50%"
        y="50%"
        dominant-baseline="middle"
        text-anchor="middle"
        fill="#9a9a9a"
        font-family="Arial, sans-serif"
        font-size="${Math.max(12, Math.floor(size * 0.16))}"
      >
        ${safeLabel}
      </text>
    </svg>
  `;

  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
};