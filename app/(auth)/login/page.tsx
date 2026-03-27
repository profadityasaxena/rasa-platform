import LoginForm from "./LoginForm"

export default function LoginPage() {
  const debugMode =
    process.env.DEBUG_MODE === "true" && process.env.NODE_ENV !== "production"

  return <LoginForm debugMode={debugMode} />
}
