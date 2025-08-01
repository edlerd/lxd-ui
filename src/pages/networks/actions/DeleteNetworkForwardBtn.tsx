import type { FC } from "react";
import { useState } from "react";
import type { LxdNetwork, LxdNetworkForward } from "types/network";
import { queryKeys } from "util/queryKeys";
import { useQueryClient } from "@tanstack/react-query";
import {
  ConfirmationButton,
  Icon,
  useNotify,
  useToastNotification,
} from "@canonical/react-components";
import { deleteNetworkForward } from "api/network-forwards";
import { useNetworkEntitlements } from "util/entitlements/networks";
import ResourceLabel from "components/ResourceLabel";

interface Props {
  network: LxdNetwork;
  forward: LxdNetworkForward;
  project: string;
}

const DeleteNetworkForwardBtn: FC<Props> = ({ network, forward, project }) => {
  const notify = useNotify();
  const toastNotify = useToastNotification();
  const queryClient = useQueryClient();
  const [isLoading, setLoading] = useState(false);
  const { canEditNetwork } = useNetworkEntitlements();

  const handleDelete = () => {
    setLoading(true);
    deleteNetworkForward(network, forward, project)
      .then(() => {
        toastNotify.success(
          <>
            Network forward with listen address{" "}
            <ResourceLabel
              type="network-forward"
              value={forward.listen_address}
              bold
            />{" "}
            deleted.
          </>,
        );
        queryClient.invalidateQueries({
          predicate: (query) =>
            query.queryKey[0] === queryKeys.projects &&
            query.queryKey[1] === project &&
            query.queryKey[2] === queryKeys.networks &&
            query.queryKey[3] === network.name,
        });
      })
      .catch((e) => {
        setLoading(false);
        notify.failure("Network forward deletion failed", e);
      });
  };

  return (
    <ConfirmationButton
      appearance="base"
      onHoverText={
        canEditNetwork(network)
          ? "Delete network forward"
          : "You do not have permission to delete this network forward"
      }
      confirmationModalProps={{
        title: "Confirm delete",
        confirmButtonAppearance: "negative",
        confirmButtonLabel: "Delete",
        children: (
          <p>
            Are you sure you want to delete the network forward with listen
            address{" "}
            <ResourceLabel
              type="network-forward"
              value={forward.listen_address}
              bold
            />
            ?<br />
          </p>
        ),
        onConfirm: handleDelete,
      }}
      className="u-no-margin--bottom has-icon"
      loading={isLoading}
      shiftClickEnabled
      showShiftClickHint
      disabled={!canEditNetwork(network) || isLoading}
    >
      <Icon name="delete" />
    </ConfirmationButton>
  );
};

export default DeleteNetworkForwardBtn;
