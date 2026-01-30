package app.kaiz.notification.application;

import app.kaiz.notification.application.dto.NotificationDto;
import app.kaiz.notification.application.dto.NotificationDto.ActionDto;
import app.kaiz.notification.application.dto.NotificationDto.SenderDto;
import app.kaiz.notification.application.dto.NotificationPreferencesDto;
import app.kaiz.notification.application.dto.NotificationPreferencesDto.CategoryPreferenceDto;
import app.kaiz.notification.domain.Notification;
import app.kaiz.notification.domain.Notification.NotificationAction;
import app.kaiz.notification.domain.NotificationPreferences;
import app.kaiz.notification.domain.NotificationPreferences.CategoryPreference;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.Named;

@Mapper(componentModel = "spring")
public interface NotificationMapper {

  @Mapping(target = "sender", source = "notification", qualifiedByName = "toSenderDto")
  @Mapping(target = "actions", source = "actions", qualifiedByName = "toActionDtoList")
  @Mapping(target = "isRead", source = "read")
  @Mapping(target = "isPinned", source = "pinned")
  @Mapping(target = "isArchived", source = "archived")
  NotificationDto toNotificationDto(Notification notification);

  List<NotificationDto> toNotificationDtoList(List<Notification> notifications);

  @Named("toSenderDto")
  default SenderDto toSenderDto(Notification notification) {
    if (notification.getSenderId() == null
        && notification.getSenderName() == null
        && notification.getSenderAvatar() == null) {
      return null;
    }
    return new SenderDto(
        notification.getSenderId(), notification.getSenderName(), notification.getSenderAvatar());
  }

  @Named("toActionDtoList")
  default List<ActionDto> toActionDtoList(List<NotificationAction> actions) {
    if (actions == null || actions.isEmpty()) {
      return null;
    }
    return actions.stream()
        .map(a -> new ActionDto(a.getId(), a.getLabel(), a.getAction(), a.getStyle()))
        .collect(Collectors.toList());
  }

  default NotificationPreferencesDto toPreferencesDto(NotificationPreferences prefs) {
    Map<String, CategoryPreferenceDto> categorySettings = new HashMap<>();
    if (prefs.getCategorySettings() != null) {
      for (Map.Entry<String, CategoryPreference> entry : prefs.getCategorySettings().entrySet()) {
        CategoryPreference cp = entry.getValue();
        categorySettings.put(
            entry.getKey(),
            new CategoryPreferenceDto(cp.isEnabled(), cp.isPush(), cp.isEmail(), cp.isInApp()));
      }
    }

    return new NotificationPreferencesDto(
        prefs.isPushEnabled(),
        prefs.isEmailEnabled(),
        prefs.isInAppEnabled(),
        prefs.isSoundEnabled(),
        prefs.isVibrationEnabled(),
        prefs.isQuietHoursEnabled(),
        prefs.getQuietHoursStart(),
        prefs.getQuietHoursEnd(),
        categorySettings);
  }
}
