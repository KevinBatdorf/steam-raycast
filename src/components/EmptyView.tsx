import { Action, ActionPanel, List } from "@raycast/api";
import { DefaultActions } from "./Actions";
import { RandomGamesList } from "./RandomGamesList";

export const EmptyView = ({ title, description }: { title: string; description: string }) => {
  return (
    <List.EmptyView
      title={title}
      icon={{ source: "steam-icon-64.png" }}
      description={description}
      actions={
        <ActionPanel>
          <Action.Push title="View My Games" target={<RandomGamesList />} />
          <DefaultActions />
        </ActionPanel>
      }
    />
  );
};
