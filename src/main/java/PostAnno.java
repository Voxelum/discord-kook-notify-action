import net.mamoe.mirai.Bot;
import net.mamoe.mirai.BotFactory;
import net.mamoe.mirai.contact.Group;
import net.mamoe.mirai.contact.announcement.AnnouncementParametersBuilder;
import net.mamoe.mirai.contact.announcement.Announcements;
import net.mamoe.mirai.contact.announcement.OfflineAnnouncement;
import net.mamoe.mirai.contact.announcement.OnlineAnnouncement;

import java.util.*;

public class PostAnno {
    public static void main(String[] args) {
        String content = System.getenv("CONTENT");

        if (content == null) {
            return;
        }

        Bot bot = BotFactory.INSTANCE.newBot(Integer.parseInt(System.getenv("QQ")), System.getenv("QQPWD"));
        bot.login();

        int groupId = 858391850;
        Group group = bot.getGroup(groupId);
        if (Objects.isNull(group)) {
            return;
        }

        content = content.trim();

        Announcements announcements = group.getAnnouncements();
        OfflineAnnouncement announcement = OfflineAnnouncement.create(content, new AnnouncementParametersBuilder()
                .isPinned(true)
                .sendToNewMember(true)
                .showPopup(true)
                .requireConfirmation(false)
                .showEditCard(false)
                .build());

        OnlineAnnouncement publish = announcements.publish(announcement);
        bot.close();
    }
}
