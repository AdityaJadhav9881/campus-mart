import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

/* A dependency-free pathname router.
   History API + popstate, exact-path matching, and SPA-safe links.
   The vercel.json rewrite sends every path to index.html so deep links
   (/marketplace, /download, …) resolve on first load. */

const RouterContext = createContext(null);

export function normalizePath(input) {
  const raw = typeof input === "string" ? input : "/";
  const withoutQuery = raw.split("?")[0].split("#")[0];
  const collapsed = `/${withoutQuery}`.replace(/\/+/g, "/").replace(/\/$/, "");
  return collapsed === "" ? "/" : collapsed;
}

export function Router({ children }) {
  const [path, setPath] = useState(() =>
    normalizePath(window.location.pathname)
  );

  useEffect(() => {
    const onPopState = () => setPath(normalizePath(window.location.pathname));
    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, []);

  const navigate = useCallback((to, options = {}) => {
    const { replace = false } = options;
    const target = normalizePath(typeof to === "string" ? to : to?.pathname);
    const current = normalizePath(window.location.pathname);

    if (target === current && !replace) return;

    if (replace) window.history.replaceState(null, "", target);
    else window.history.pushState(null, "", target);

    setPath(target);
  }, []);

  const value = useMemo(
    () => ({ path, navigate, location: { pathname: path } }),
    [path, navigate]
  );

  return (
    <RouterContext.Provider value={value}>{children}</RouterContext.Provider>
  );
}

export function useRouter() {
  const ctx = useContext(RouterContext);
  if (!ctx) throw new Error("useRouter must be used inside <Router>");
  return ctx;
}

export function useNavigate() {
  return useRouter().navigate;
}

export function useLocation() {
  return useRouter().location;
}

export function Link({ to, onClick, children, ...rest }) {
  const navigate = useNavigate();

  const handleClick = (event) => {
    onClick?.(event);
    if (event.defaultPrevented) return;
    if (event.button !== 0) return;
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    if (rest.target && rest.target !== "_self") return;

    event.preventDefault();
    navigate(to);
  };

  return (
    <a href={to} onClick={handleClick} {...rest}>
      {children}
    </a>
  );
}

export function NavLink({
  to,
  className = "",
  activeClassName = "",
  children,
  ...rest
}) {
  const { path } = useRouter();
  const target = normalizePath(to);
  const isActive =
    target === "/" ? path === "/" : path === target || path.startsWith(`${target}/`);

  const resolved =
    typeof className === "function"
      ? className({ isActive })
      : `${className}${isActive ? ` ${activeClassName}` : ""}`;

  return (
    <Link to={target} className={resolved} aria-current={isActive ? "page" : undefined} {...rest}>
      {children}
    </Link>
  );
}

/* Matches an ordered route list; falls back to `notFound`. */
export function Routes({ routes, notFound = null }) {
  const { path } = useRouter();
  const match = routes.find((route) => route.path === path);
  return <>{match ? match.element : notFound}</>;
}
