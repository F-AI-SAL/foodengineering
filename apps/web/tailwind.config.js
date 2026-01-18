/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        primary: "var(--color-primary)",
        "primary-hover": "var(--color-primary-hover)",
        "primary-contrast": "var(--color-primary-contrast)",
        secondary: "var(--color-secondary)",
        "secondary-hover": "var(--color-secondary-hover)",
        "secondary-contrast": "var(--color-secondary-contrast)",
        accent: "var(--color-accent)",
        "accent-hover": "var(--color-accent-hover)",
        "accent-contrast": "var(--color-accent-contrast)",
        destructive: "var(--color-destructive)",
        "destructive-hover": "var(--color-destructive-hover)",
        "destructive-contrast": "var(--color-destructive-contrast)",
        success: "var(--color-success)",
        warning: "var(--color-warning)",
        info: "var(--color-info)",
        surface: "var(--color-surface)",
        "surface-alt": "var(--color-surface-alt)",
        border: "var(--color-border)",
        muted: "var(--color-muted)",
        "muted-contrast": "var(--color-muted-contrast)",
        "status": {
          pending: "var(--status-pending)",
          confirmed: "var(--status-confirmed)",
          preparing: "var(--status-preparing)",
          ready: "var(--status-ready)",
          on_delivery: "var(--status-on-delivery)",
          delivered: "var(--status-delivered)",
          cancelled: "var(--status-cancelled)"
        },
        "status-contrast": {
          pending: "var(--status-pending-contrast)",
          confirmed: "var(--status-confirmed-contrast)",
          preparing: "var(--status-preparing-contrast)",
          ready: "var(--status-ready-contrast)",
          on_delivery: "var(--status-on-delivery-contrast)",
          delivered: "var(--status-delivered-contrast)",
          cancelled: "var(--status-cancelled-contrast)"
        }
      },
      spacing: {
        xs: "var(--spacing-xs)",
        sm: "var(--spacing-sm)",
        md: "var(--spacing-md)",
        lg: "var(--spacing-lg)",
        xl: "var(--spacing-xl)",
        "2xl": "var(--spacing-2xl)"
      },
      borderRadius: {
        sm: "var(--radius-sm)",
        md: "var(--radius-md)",
        lg: "var(--radius-lg)",
        xl: "var(--radius-xl)",
        "2xl": "var(--radius-2xl)",
        full: "var(--radius-full)"
      },
      boxShadow: {
        sm: "var(--shadow-sm)",
        md: "var(--shadow-md)",
        lg: "var(--shadow-lg)",
        xl: "var(--shadow-xl)"
      },
      fontFamily: {
        heading: ["var(--font-heading)"],
        body: ["var(--font-body)"]
      },
      fontSize: {
        xs: "var(--font-size-xs)",
        sm: "var(--font-size-sm)",
        md: "var(--font-size-md)",
        lg: "var(--font-size-lg)",
        xl: "var(--font-size-xl)",
        "2xl": "var(--font-size-2xl)",
        "3xl": "var(--font-size-3xl)",
        "4xl": "var(--font-size-4xl)"
      },
      lineHeight: {
        tight: "var(--line-height-tight)",
        normal: "var(--line-height-normal)",
        relaxed: "var(--line-height-relaxed)"
      },
      maxWidth: {
        content: "var(--layout-content)"
      },
      width: {
        sidebar: "var(--layout-sidebar)",
        "map-panel": "var(--layout-map-panel)"
      },
      height: {
        "map-panel": "var(--layout-map-height)",
        "hero": "var(--layout-hero-height)"
      },
      opacity: {
        disabled: "var(--opacity-disabled)"
      }
    }
  },
  plugins: []
};
