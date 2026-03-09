import { MapPinned, Home, ScanSearch } from "lucide-react";
import { NavLink } from "react-router-dom";
import { Separator } from "../ui/separator";

const items = [
  {
    label: "Home",
    to: "/",
    icon: Home,
  },
  {
    label: "Data Annotator",
    to: "/annotator",
    icon: ScanSearch,
  },
];

export default function AppSidebar() {
  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="flex shrink-0 gap-3 px-6 py-5">
          <img src="/ezpark_logo.svg" alt="EZPark Logo" className="flex h-15 w-15 items-center justify-center rounded-xl" />
        <div>
          <p className="font-semibold text-xl text-slate-900">EZPark Admin</p>
          <p className="text-sm text-slate-500">Dashboard</p>
        </div>
      </div>

      <Separator className="shrink-0" />

      <nav className="flex-1 space-y-2 overflow-y-auto p-4">
        {items.map((item) => {
          const Icon = item.icon;

          return (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                [
                  "flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition",
                  isActive
                    ? "bg-slate-900 text-white shadow-sm"
                    : "text-slate-700 hover:bg-slate-100",
                ].join(" ")
              }
            >
              <Icon className="h-4 w-4" />
              {item.label}
            </NavLink>
          );
        })}
      </nav>

      {/* <div className="shrink-0 p-4">
        <div className="rounded-2xl border bg-slate-50 p-4">
          <p className="text-sm font-medium text-slate-900">Next step</p>
          <p className="mt-1 text-xs text-slate-500">
            Use the Data Annotator page later to draw and manage parking slot boxes.
          </p>
        </div>
      </div> */}
    </div>
  );
}