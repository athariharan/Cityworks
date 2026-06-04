const React = require("react");

const mockNavigate = jest.fn();

module.exports = {
  // Router wrappers — just render children
  MemoryRouter:    ({ children }) => children,
  BrowserRouter:   ({ children }) => children,
  HashRouter:      ({ children }) => children,

  useNavigate: () => mockNavigate,
  Routes:   ({ children }) => children,
  Route:    () => null,
  Outlet:   () => null,
  Navigate: () => null,
  Link:    ({ children, to, ...rest }) => React.createElement("a", { href: to, ...rest }, children),
  NavLink: ({ children, to, ...rest }) => React.createElement("a", { href: to, ...rest }, children),
  useParams:       () => ({}),
  useLocation:     () => ({ pathname: "/", state: null, search: "", hash: "" }),
  useSearchParams: () => [new URLSearchParams(), jest.fn()],
  useMatch:        () => null,

  __mockNavigate: mockNavigate,
};
