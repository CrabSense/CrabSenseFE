import { NavLink } from "react-router-dom";

function SidebarNavItem({ to, icon: Icon, label, collapsed = false, onClick }) {
  return (
    <NavLink
      to={to}
      end
      onClick={onClick}
      title={collapsed ? label : undefined}
      aria-label={label}
      className={({ isActive }) =>
        [
          "group relative flex h-[46px] w-full",
          "items-center overflow-hidden rounded-xl",
          "border text-[13px] font-medium",
          "no-underline",

          // Background and border animations
          "transition-[background-color,border-color,color]",
          "duration-200 ease-out",

          isActive
            ? [
                "border-[#77FF00]/20",
                "bg-[#77FF00]/10",
                "text-[#77FF00]",
                "before:absolute before:inset-y-3",
                "before:left-0 before:w-[3px]",
                "before:rounded-r-full",
                "before:bg-[#77FF00]",
              ].join(" ")
            : [
                "border-transparent",
                "text-[#99AA9D]",
                "hover:bg-white/[0.045]",
                "hover:text-[#F4F7F4]",
              ].join(" "),
        ].join(" ")
      }
    >
      {({ isActive }) => (
        <>
          {/* ICON - MOVES SMOOTHLY */}
          <span
            className={[
              "absolute top-1/2",
              "flex h-6 w-6 shrink-0",
              "items-center justify-center",
              "-translate-y-1/2",

              // Animate icon position independently
              "transition-[left,transform]",
              "duration-[320ms]",
              "ease-[cubic-bezier(0.22,1,0.36,1)]",
              "motion-reduce:transition-none",

              collapsed
                ? ["min-[901px]:left-1/2", "min-[901px]:-translate-x-1/2"].join(
                    " ",
                  )
                : ["min-[901px]:left-3", "min-[901px]:translate-x-0"].join(" "),

              // Always expanded on mobile
              "max-[900px]:left-3",
              "max-[900px]:translate-x-0",
            ].join(" ")}
          >
            <Icon
              size={19}
              strokeWidth={1.9}
              aria-hidden="true"
              className={isActive ? "text-[#77FF00]" : ""}
            />
          </span>

          {/* LABEL - DELAYED FADE IN */}
          <span
            className={[
              "absolute left-12 right-5",
              "truncate whitespace-nowrap",

              "transition-opacity",
              "duration-[180ms]",
              "ease-out",
              "motion-reduce:transition-none",

              collapsed
                ? [
                    "min-[901px]:opacity-0",
                    "min-[901px]:invisible",
                    "min-[901px]:delay-0",
                  ].join(" ")
                : [
                    "min-[901px]:opacity-100",
                    "min-[901px]:visible",
                    "min-[901px]:delay-[270ms]",
                  ].join(" "),

              "max-[900px]:opacity-100",
              "max-[900px]:visible",
            ].join(" ")}
          >
            {label}
          </span>

          {/* ACTIVE INDICATOR */}
          {isActive && (
            <span
              aria-hidden="true"
              className={[
                "absolute right-3 top-1/2",
                "h-1.5 w-1.5",
                "-translate-y-1/2",
                "rounded-full bg-[#77FF00]",

                "transition-opacity",
                "duration-[180ms]",
                "ease-out",

                collapsed
                  ? "min-[901px]:opacity-0"
                  : "min-[901px]:opacity-100 min-[901px]:delay-[270ms]",

                "max-[900px]:opacity-100",
              ].join(" ")}
            />
          )}
        </>
      )}
    </NavLink>
  );
}

export default SidebarNavItem;
