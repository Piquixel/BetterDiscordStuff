import React from "react";
import { useStateFromStores } from "@discord/flux";
import { Channels, Guilds, SelectedChannels, Users } from "@discord/stores";
import { WebpackModules, DiscordModules, ContextMenu } from "@zlibrary";
import Settings from "../modules/settings";
import Strings from "../modules/strings";
import { checkPermissions, groupDMName } from "../modules/utils";
import style from "./voicepopoutsection.scss";
import GuildImage from "./GuildImage";
import { CallJoin, Speaker, Stage } from "./icons";
import WrappedPartyAvatars from "./WrappedPartyAvatars";

const { NavigationUtils, ChannelActions } = DiscordModules;
const VoiceStates = WebpackModules.getByProps("getVoiceStateForUser");

const { TooltipContainer } = WebpackModules.getByProps("TooltipContainer");

export default function VoicePopoutSection(props) {
	const ignoreEnabled = useStateFromStores([Settings], () => Settings.get("ignoreEnabled", false));
	const ignoredChannels = useStateFromStores([Settings], () => Settings.get("ignoredChannels", []));
	const ignoredGuilds = useStateFromStores([Settings], () => Settings.get("ignoredGuilds", []));

	const voiceState = useStateFromStores([VoiceStates], () => VoiceStates.getVoiceStateForUser(props.userId));
	const currentUserVoiceState = useStateFromStores([VoiceStates], () => VoiceStates.getVoiceStateForUser(Users.getCurrentUser()?.id));

	if (!voiceState) return null;
	const channel = Channels.getChannel(voiceState.channelId);
	if (!channel) return null;
	const guild = Guilds.getGuild(channel.guild_id);

	if (guild && !checkPermissions(guild, channel)) return null;
	if (ignoreEnabled && (ignoredChannels.includes(channel.id) || ignoredGuilds.includes(guild?.id))) return null;

	let headerText, text, viewButton, joinButton, Icon, channelPath;
	const members = Object.keys(VoiceStates.getVoiceStatesForChannel(channel.id)).map(id => Users.getUser(id));
	const hasOverflow = members.length > 3;
	const inCurrentChannel = channel.id === currentUserVoiceState?.channelId;
	const channelSelected = channel.id === SelectedChannels.getChannelId();
	const isCurrentUser = props.userId === Users.getCurrentUser().id;

	if (guild) {
		headerText = Strings.get("HEADER");
		text = [<h3>{guild.name}</h3>, <div>{channel.name}</div>];
		viewButton = Strings.get("VIEW");
		joinButton = inCurrentChannel ? Strings.get("JOIN_DISABLED") : Strings.get("JOIN");
		Icon = Speaker;
		channelPath = `/channels/${guild.id}/${channel.id}`;
	} else {
		headerText = Strings.get("HEADER_VOICE");
		text = <h3>{channel.name}</h3>;
		viewButton = Strings.get("VIEW_CALL");
		joinButton = inCurrentChannel ? Strings.get("JOIN_DISABLED_CALL") : Strings.get("JOIN_CALL");
		Icon = CallJoin;
		channelPath = `/channels/@me/${channel.id}`;
	}
	switch (channel.type) {
		case 1:
			headerText = Strings.get("HEADER_PRIVATE");
			break;
		case 3:
			headerText = Strings.get("HEADER_GROUP");
			text = <h3>{channel.name ?? groupDMName(channel.recipients)}</h3>;
			break;
		case 13:
			headerText = Strings.get("HEADER_STAGE");
			Icon = Stage;
	}

	return (
		<div className={style.popoutSection}>
			<h3 className={style.header}>{headerText}</h3>
			{!(channel.type === 1) && (
				<div className={hasOverflow ? `${style.body} ${style.hasOverflow}` : style.body}>
					<GuildImage guild={guild} channel={channel} channelPath={channelPath} />
					<div className={style.text}>{text}</div>
					<WrappedPartyAvatars guild={guild} channel={channel} members={members} />
				</div>
			)}
			<div className={style.buttonWrapper}>
				<button
					className={`${style.button} ${style.viewButton}`}
					disabled={channelSelected}
					onClick={() => {
						if (channelPath) NavigationUtils.transitionTo(channelPath);
					}}
				>
					{viewButton}
				</button>
				{!isCurrentUser && (
					<TooltipContainer text={joinButton} position="top" className={inCurrentChannel ? `${style.joinWrapper} ${style.joinWrapperDisabled}` : style.joinWrapper}>
						<button
							className={`${style.button} ${style.joinButton}`}
							disabled={inCurrentChannel}
							onClick={() => {
								if (channel.id) ChannelActions.selectVoiceChannel(channel.id);
							}}
							onContextMenu={e => {
								if (channel.type === 13) return;
								ContextMenu.openContextMenu(
									e,
									ContextMenu.buildMenu([
										{
											label: Strings.get("JOIN_VIDEO"),
											id: "voice-activity-join-with-video",
											action: () => {
												if (channel.id) ChannelActions.selectVoiceChannel(channel.id, true);
											}
										}
									])
								);
							}}
						>
							<Icon width="18" height="18" />
						</button>
					</TooltipContainer>
				)}
			</div>
		</div>
	);
}
