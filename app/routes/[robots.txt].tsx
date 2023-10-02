export const loader = () => {
  const robotsText = `
    User-agent: *
    Disallow: /
  `;

  return new Response(robotsText, {
    status: 200,
    headers: {
      'Content-Type': 'text/plain;charset=UTF-8',
    },
  });
};
