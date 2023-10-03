const PREFERS_DARK_MEDIA_QUERY = '(prefers-color-scheme: dark)';

/**
 * Script to be placed in `<head>` tag to block rendering while theme
 * preference is resolved so as to prevent a flash of the wrong theme.
 */
export function ThemeScript() {
  return (
    <script
      dangerouslySetInnerHTML={{
        __html: `
      const prefersDarkMode = window.matchMedia(${JSON.stringify(
        PREFERS_DARK_MEDIA_QUERY
      )}).matches
      if (prefersDarkMode) {
        document.documentElement.classList.add('dark')
      }
    `,
      }}
    ></script>
  );
}
