// src/theme.js
import { extendTheme } from "@chakra-ui/react";

const theme = extendTheme({
  config: { initialColorMode: "light", useSystemColorMode: false },
  fonts: {
    heading: "'Poppins', system-ui, -apple-system, Segoe UI, Inter, Roboto, sans-serif",
    body: "'Inter', system-ui, -apple-system, Segoe UI, Inter, Roboto, sans-serif",
  },
  styles: {
    global: {
      "html, body, #root": { height: "100%" },
      // 👇 cuerpo en BLANCO; el panel verde lo damos en el componente Inicio
      body: { bg: "white", color: "gray.800" },
    },
  },
  colors: {
    brand: {
      50:  "#EAF7F0",
      100: "#D6F0E1",
      200: "#AEE0C4",
      300: "#86D1A7",
      400: "#5EC189",
      500: "#2F855A",
      600: "#2B6B4B",
      700: "#22543D",
      800: "#1C4532",
      900: "#153E2B",
    },
  },
  components: {
    Card: {
      baseStyle: {
        container: {
          bg: "white",
          borderRadius: "2xl",
          borderWidth: "1px",
          borderColor: "blackAlpha.100",
          boxShadow:
            "0 12px 20px -6px rgba(16,24,40,0.08), 0 6px 10px -4px rgba(16,24,40,0.03)",
        },
      },
    },
    FormLabel: { baseStyle: { color: "gray.700", fontWeight: 600 } },
    Input: {
      defaultProps: { size: "md", variant: "outline", focusBorderColor: "brand.500" },
      baseStyle: { field: { borderRadius: "lg", _placeholder: { color: "gray.400" } } },
    },
    Textarea: {
      defaultProps: { size: "md", variant: "outline", focusBorderColor: "brand.500" },
      baseStyle: { borderRadius: "lg", _placeholder: { color: "gray.400" } },
    },
    Button: {
      baseStyle: { borderRadius: "lg", fontWeight: 600 },
      variants: {
        solid:  { bg: "brand.500", _hover: { bg: "brand.600" } },
        ghost:  { _hover: { bg: "gray.50" } },
        outline:{ _hover: { bg: "blackAlpha.50" } },
      },
    },
  },
});

export default theme;
