import React from "react";
import { Link } from "react-router-dom";

export function itemRender(route, params, routes, paths) {
  const last = routes.indexOf(route) === routes.length - 1;

  return last ? (
    <span>{route.name}</span>
    ) : (
    <Link to={route.path}>{route.name}</Link>
  );
}
