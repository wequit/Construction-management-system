import { Outlet } from "react-router-dom";
import { BottomNavigationBar } from "../../shared/ui/bottom-navigation-bar/bottom-navigation-bar";

export const AppLayout = () => {
  return (
    <div>
      <main className="pb-16">
        <Outlet />
      </main>
      <BottomNavigationBar />
    </div>
  )
}