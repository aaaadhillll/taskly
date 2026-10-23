import { useEffect } from "react"
import { AppShell } from "@/components/layout/AppShell"
import { useReminders } from "@/hooks/useReminders"
import { useRoute, type Route } from "@/hooks/useRoute"
import { CategoriesProvider, useCategories } from "@/hooks/useCategories"
import { SettingsProvider, useSettings } from "@/hooks/useSettings"
import { TasksProvider, useTasks } from "@/hooks/useTasks"
import { UiProvider } from "@/hooks/useUi"
import { CalendarPage } from "@/pages/Calendar"
import { CategoriesPage, CategoryPage } from "@/pages/Categories"
import { Home } from "@/pages/Home"
import { TasksPage } from "@/pages/Tasks"
import { WelcomePage } from "@/pages/Welcome"
import { SettingsPage } from "@/pages/Settings"
import { StatsPage } from "@/pages/Stats"
import { TaskDetail } from "@/pages/TaskDetail"

function Page({ route }: { route: Route }) {
  switch (route.name) {
    case "welcome":
      return <WelcomePage />
    case "home":
      return <Home />
    case "tasks":
      return <TasksPage />
    case "calendar":
      return <CalendarPage />
    case "stats":
      return <StatsPage />
    case "categories":
      return <CategoriesPage />
    case "category":
      return <CategoryPage key={route.id} id={route.id} />
    case "settings":
      return <SettingsPage />
    case "task":
      return <TaskDetail key={route.id} id={route.id} />
  }
}

function Screens() {
  const rawRoute = useRoute()
  const { tasks } = useTasks()
  const { reminders, welcomed } = useSettings()
  const { allCategories } = useCategories()
  // First visit: the welcome screen stands in for Home until "Get Started"
  const route: Route = !welcomed && rawRoute.name === "home" ? { name: "welcome" } : rawRoute
  useReminders(reminders, tasks)

  // The tab title names the screen, so history and screen readers can tell them apart
  const taskTitle = route.name === "task" ? tasks.find((t) => t.id === route.id)?.title : undefined
  useEffect(() => {
    const catLabel = route.name === "category" ? allCategories.find(c => c.id === route.id)?.label ?? "Category" : ""
    const screen =
      route.name === "task" ? (taskTitle ?? "Task") :
      route.name === "category" ? catLabel :
      route.name === "home" ? "Home" :
      route.name === "welcome" ? "Welcome" :
      route.name[0]!.toUpperCase() + route.name.slice(1)
    document.title = `${screen} · Taskly`
  }, [route, taskTitle, allCategories])

  return (
    <AppShell route={route}>
      <Page route={route} />
    </AppShell>
  )
}

export default function App() {
  return (
    <SettingsProvider>
      <TasksProvider>
        <CategoriesProvider>
          <UiProvider>
            <Screens />
          </UiProvider>
        </CategoriesProvider>
      </TasksProvider>
    </SettingsProvider>
  )
}
