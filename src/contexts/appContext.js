/**
 * @fileoverview Instance du contexte React — séparée pour satisfaire react-refresh
 */
import { createContext } from "react";

/** @type {React.Context} */
export const AppContext = createContext(null);
