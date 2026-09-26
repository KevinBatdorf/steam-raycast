import { Action, ActionPanel, Icon, List } from "@raycast/api";
import { useCachedPromise } from "@raycast/utils";
import { useState } from "react";
import { SteamUserDetails } from "./components/SteamUserDetails";
import { NoWebApiKey } from "./errors";
import {
  cleanSteamUserQuery,
  getPersonaStateText,
  getProfileVisibilityText,
  hasSteamWebApiKey,
  searchSteamUsers,
  SteamUserSearchResult,
} from "./lib/users";

export default function Command() {
  const [search, setSearch] = useState("");
  const hasApiKey = hasSteamWebApiKey();
  const query = cleanSteamUserQuery(search);
  const shouldSearch = hasApiKey && query.length >= 2;
  const { data, error, isLoading } = useCachedPromise(
    (term: string) => searchSteamUsers(term, { maxResults: 20 }),
    [query],
    // The empty view explains the failure, so skip the default toast
    { execute: shouldSearch, keepPreviousData: true, onError: () => undefined },
  );

  if (!hasApiKey) {
    return <NoWebApiKey />;
  }

  return (
    <List
      isLoading={Boolean(shouldSearch && isLoading)}
      onSearchTextChange={setSearch}
      throttle
      filtering={false}
      searchBarPlaceholder="Search by Steam ID, profile URL, vanity URL, or display name..."
    >
      {!query ? (
        <List.EmptyView title="Search Steam Users" icon={Icon.PersonCircle} />
      ) : error ? (
        <List.EmptyView
          title="Could Not Search Users"
          description={error instanceof Error ? error.message : "Try again later."}
          icon={Icon.ExclamationMark}
        />
      ) : data?.results.length ? (
        <List.Section
          title="Search Results"
          subtitle={
            data.totalCount !== undefined ? `${data.totalCount.toLocaleString()} Steam Community matches` : undefined
          }
        >
          {data.results.map((user) => (
            <SteamUserListItem key={user.steamid} user={user} />
          ))}
        </List.Section>
      ) : shouldSearch && !isLoading ? (
        <List.EmptyView title="No Users Found" icon={Icon.PersonCircle} />
      ) : (
        <List.EmptyView title="Keep Typing" icon={Icon.MagnifyingGlass} />
      )}
    </List>
  );
}

function SteamUserListItem({ user }: { user: SteamUserSearchResult }) {
  const status = user.gameextrainfo ? `Playing ${user.gameextrainfo}` : getPersonaStateText(user.personastate);

  return (
    <List.Item
      id={user.steamid}
      title={user.personaname}
      subtitle={user.realname ?? user.profileurl}
      icon={user.avatarmedium ? { source: user.avatarmedium } : Icon.Person}
      accessories={[
        { text: status },
        { text: getProfileVisibilityText(user.communityvisibilitystate) },
        { text: matchTypeLabel(user.matchType) },
      ]}
      actions={
        <ActionPanel>
          <Action.Push
            icon={Icon.PersonCircle}
            title="View User Details"
            target={<SteamUserDetails steamid={user.steamid} />}
          />
          <Action.OpenInBrowser icon={Icon.Globe} title="Open Profile in Browser" url={user.profileurl} />
          <Action.CopyToClipboard icon={Icon.CopyClipboard} title="Copy Steam ID" content={user.steamid} />
          <Action.CopyToClipboard icon={Icon.Link} title="Copy Profile URL" content={user.profileurl} />
        </ActionPanel>
      }
    />
  );
}

function matchTypeLabel(matchType: SteamUserSearchResult["matchType"]) {
  switch (matchType) {
    case "steamid":
      return "Steam ID";
    case "vanity":
      return "Vanity";
    case "community-search":
      return "Search";
  }
}
