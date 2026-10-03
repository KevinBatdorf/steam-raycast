import { Action, ActionPanel, Color, Detail, getPreferenceValues, Icon, openExtensionPreferences } from "@raycast/api";
import { useKeyRejected } from "./lib/hooks";

export const AccountNotice = ({ keyRejected = false }: { keyRejected?: boolean }) => {
  const { steamid } = getPreferenceValues<Preferences>();
  // The stored rejection loads async, and with a Steam ID set only a rejected key leads here
  const rejected = useKeyRejected() || keyRejected || Boolean(steamid?.trim());
  const markdown = (
    rejected
      ? [
          "## Steam Rejected Your Web API Key",
          "",
          "Get a new key here:",
          "",
          "[https://steamcommunity.com/dev/apikey](https://steamcommunity.com/dev/apikey)",
          "",
          "Then add it to the extension preferences page.",
        ]
      : [
          "## Add Your Steam ID",
          "",
          "Your games and recently played games need your Steam ID. It's on [store.steampowered.com/account](https://store.steampowered.com/account/).",
          "",
          "Add it to the extension preferences page. Your profile URL or custom URL name works too.",
        ]
  ).join("\n");

  return (
    <Detail
      markdown={markdown}
      navigationTitle="Steam Account"
      metadata={
        <Detail.Metadata>
          <Detail.Metadata.TagList title="Web API Key">
            {rejected ? (
              <Detail.Metadata.TagList.Item text="Rejected" color={Color.Red} />
            ) : (
              <Detail.Metadata.TagList.Item text="OK" color={Color.Green} />
            )}
          </Detail.Metadata.TagList>
          <Detail.Metadata.TagList title="Steam ID">
            {steamid ? (
              <Detail.Metadata.TagList.Item text="OK" color={Color.Green} />
            ) : (
              <Detail.Metadata.TagList.Item text="Not set" color={Color.Red} />
            )}
          </Detail.Metadata.TagList>
        </Detail.Metadata>
      }
      actions={
        <ActionPanel>
          <Action icon={Icon.Gear} title="Open Extension Preferences" onAction={openExtensionPreferences} />
        </ActionPanel>
      }
    />
  );
};
