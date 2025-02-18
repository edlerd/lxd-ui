import { FC } from "react";
import {
  Button,
  EmptyState,
  Icon,
  MainTable,
  Row,
  useNotify,
} from "@canonical/react-components";
import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "util/queryKeys";
import type { LxdNetwork } from "types/network";
import Loader from "components/Loader";
import { fetchNetworkForwards } from "api/network-forwards";
import { useDocs } from "context/useDocs";
import DeleteNetworkForwardBtn from "pages/networks/actions/DeleteNetworkForwardBtn";
import { useNavigate } from "react-router-dom";
import ExpandableList from "components/ExpandableList";
import NetworkForwardPort from "pages/networks/NetworkForwardPort";
import ScrollableTable from "components/ScrollableTable";
import { useNetworkEntitlements } from "util/entitlements/networks";

interface Props {
  network: LxdNetwork;
  project: string;
}

const NetworkForwards: FC<Props> = ({ network, project }) => {
  const docBaseLink = useDocs();
  const notify = useNotify();
  const { canEditNetwork } = useNetworkEntitlements();
  const navigate = useNavigate();

  const {
    data: forwards = [],
    error,
    isLoading,
  } = useQuery({
    queryKey: [
      queryKeys.projects,
      project,
      queryKeys.networks,
      network.name,
      queryKeys.forwards,
    ],
    queryFn: () => fetchNetworkForwards(network.name, project),
  });

  if (error) {
    notify.failure("Loading network forwards failed", error);
  }

  const hasNetworkForwards = forwards.length > 0;

  const headers = [
    { content: "Listen address", sortKey: "listenAddress" },
    { content: "Description", sortKey: "description" },
    { content: "Default target address", sortKey: "defaultTarget" },
    { content: "Ports" },
    { "aria-label": "Actions", className: "u-align--right actions" },
  ];

  const rows = forwards.map((forward) => {
    return {
      key: forward.listen_address,
      columns: [
        {
          content: forward.listen_address,
          role: "cell",
          "aria-label": "Listen address",
        },
        {
          content: forward.description,
          role: "cell",
          "aria-label": "Description",
        },
        {
          content: forward.config.target_address,
          role: "cell",
          "aria-label": "Default target address",
        },
        {
          content: (
            <ExpandableList
              items={forward.ports.map((port) => (
                <NetworkForwardPort key={port.listen_port} port={port} />
              ))}
            />
          ),
          role: "cell",
          "aria-label": "Forwarded ports",
        },
        {
          content: (
            <>
              <Button
                key="edit"
                appearance="base"
                className="u-no-margin--bottom"
                dense
                hasIcon
                onClick={() =>
                  void navigate(
                    `/ui/project/${project}/network/${network.name}/forwards/${forward.listen_address}/edit`,
                  )
                }
                type="button"
                title={
                  canEditNetwork(network)
                    ? "Edit network forward"
                    : "You do not have permission to edit forwards for this network"
                }
                disabled={!canEditNetwork(network)}
              >
                <Icon name="edit" />
              </Button>
              <DeleteNetworkForwardBtn
                key={forward.listen_address}
                network={network}
                forward={forward}
                project={project}
              />
            </>
          ),
          role: "rowheader",
          className: "u-align--right actions",
          "aria-label": "Actions",
        },
      ],
      sortData: {
        listenAddress: forward.listen_address,
        description: forward.description,
        defaultTarget: forward.config.target_address ?? "",
      },
    };
  });

  if (isLoading) {
    return <Loader />;
  }

  return (
    <>
      <Button
        appearance="positive"
        className="u-float-right u-no-margin--bottom"
        onClick={() =>
          void navigate(
            `/ui/project/${project}/network/${network.name}/forwards/create`,
          )
        }
        disabled={!canEditNetwork(network)}
        title={
          canEditNetwork(network)
            ? ""
            : "You do not have permission to create network forwards for this network"
        }
      >
        <span>Create forward</span>
      </Button>
      <Row>
        {hasNetworkForwards && (
          <ScrollableTable
            dependencies={forwards}
            tableId="network-forwards-table"
            belowIds={["status-bar"]}
          >
            <MainTable
              id="network-forwards-table"
              headers={headers}
              expanding
              rows={rows}
              paginate={30}
              sortable
              defaultSort="listenAddress"
              defaultSortDirection="ascending"
              className="u-table-layout--auto network-forwards-table"
              emptyStateMsg="No data to display"
            />
          </ScrollableTable>
        )}
        {!isLoading && !hasNetworkForwards && (
          <EmptyState
            className="empty-state"
            image={<Icon className="empty-state-icon" name="exposed" />}
            title="No network forwards found"
          >
            <p>There are no network forwards in this project.</p>
            <p>
              <a
                href={`${docBaseLink}/howto/network_forwards/`}
                target="_blank"
                rel="noopener noreferrer"
              >
                Learn more about network forwards
                <Icon className="external-link-icon" name="external-link" />
              </a>
            </p>
          </EmptyState>
        )}
      </Row>
    </>
  );
};

export default NetworkForwards;
