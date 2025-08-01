import type { DependencyList, FC, ReactNode } from "react";
import { useEffect } from "react";
import {
  getAbsoluteHeightBelowById,
  getParentsBottomSpacing,
} from "util/helpers";
import { useListener } from "@canonical/react-components";

interface Props {
  children: ReactNode;
  dependencies: DependencyList;
  tableId: string;
  belowIds?: string[];
  className?: string;
}

const ScrollableTable: FC<Props> = ({
  dependencies,
  children,
  tableId,
  belowIds = [],
}) => {
  const updateTBodyHeight = () => {
    const table = document.getElementById(tableId);
    if (!table || table.children.length !== 2) {
      return;
    }

    const tBody = table.children[1];
    const above = tBody.getBoundingClientRect().top + 1;
    const below = belowIds.reduce(
      (acc, belowId) => acc + getAbsoluteHeightBelowById(belowId),
      0,
    );
    const parentsBottomSpacing = getParentsBottomSpacing(table);
    const offset = Math.ceil(above + below + parentsBottomSpacing);
    const style = `height: calc(100dvh - ${offset}px); min-height: calc(100dvh - ${offset}px)`;
    tBody.setAttribute("style", style);
  };

  useListener(window, updateTBodyHeight, "resize", true);
  useEffect(updateTBodyHeight, [...dependencies]);

  return <div className="scrollable-table">{children}</div>;
};

export default ScrollableTable;
