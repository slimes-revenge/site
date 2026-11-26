import { Box } from "@mui/material";
import type { IntlShape } from "react-intl";

import type { Status } from "../../data/wiki";

const color: Record<Status, string> = {
  decided: "success.main",
  working: "info.main",
  proposal: "warning.main",
  idea: "text.disabled",
};

// A small dot next to a name: the item's design status, spelled out in the tooltip and for screen readers.
export function StatusMark({ status, intl }: { status: Status; intl: IntlShape }) {
  const label = intl.formatMessage({ id: `status.${status}` });
  return (
    <Box
      component="span"
      role="img"
      aria-label={label}
      title={label}
      sx={{
        display: "inline-block",
        width: 8,
        height: 8,
        borderRadius: "50%",
        bgcolor: color[status],
        ml: 0.75,
        verticalAlign: "middle",
      }}
    />
  );
}
