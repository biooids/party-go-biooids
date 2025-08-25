// src/lib/hooks/hooks.ts

import { useDispatch, useSelector } from "react-redux";
import type { RootState, AppDispatch } from "../store";

/**
 * A pre-typed version of the `useDispatch` hook.
 * Using this throughout the app ensures that dispatched actions are type-safe.
 */
export const useAppDispatch = useDispatch.withTypes<AppDispatch>();

/**
 * A pre-typed version of the `useSelector` hook.
 * Using this ensures that the state selected from the store is type-safe.
 */
export const useAppSelector = useSelector.withTypes<RootState>();
