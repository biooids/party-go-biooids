// src/components/ReduxProvider.tsx

"use client";

import { store } from "@/lib/store";
import { Provider } from "react-redux";

/**
 * A client-side component that wraps the entire application, making the
 * Redux store available to all child components via the `useSelector` and `useDispatch` hooks.
 */
export default function ReduxProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  return <Provider store={store}>{children}</Provider>;
}
