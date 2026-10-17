import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

/* A robust dependency-free browser History router with full query string and hash support. */

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
  const [search, setSearch] = useState(() => window.location.search);

  useEffect(() => {
    const onPopState = () => {
      setPath(normalizePath(window.location.pathname));
      setSearch(window.location.search);
    };
    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, []);

  const navigate = useCallback((to, options = {}) => {
    const { replace = false } = options;
    const raw = typeof to === "string" ? to : `${to?.pathname || "/"}${to?.search || ""}`;
    const [pathPart, ...queryParts] = raw.split("?");
    const targetPath = normalizePath(pathPart);
    const queryString = queryParts.length > 0 ? `?${queryParts.join("?")}` : "";
    const fullTarget = `${targetPath}${queryString}`;

    const currentFull = `${normalizePath(window.location.pathname)}${window.location.search}`;

    if (fullTarget === currentFull && !replace) return;

    if (replace) window.history.replaceState(null, "", fullTarget);
    else window.history.pushState(null, "", fullTarget);

    setPath(targetPath);
    setSearch(queryString);
  }, []);

  const value = useMemo(
    () => ({
      path,
      search,
      navigate,
      location: { pathname: path, search },
    }),
    [path, search, navigate]
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
  const targetPath = normalizePath(typeof to === "string" ? to : to?.pathname);
  const isActive =
    targetPath === "/" ? path === "/" : path === targetPath || path.startsWith(`${targetPath}/`);

  const resolved =
    typeof className === "function"
      ? className({ isActive })
      : `${className}${isActive ? ` ${activeClassName}` : ""}`;

  return (
    <Link to={to} className={resolved} aria-current={isActive ? "page" : undefined} {...rest}>
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
