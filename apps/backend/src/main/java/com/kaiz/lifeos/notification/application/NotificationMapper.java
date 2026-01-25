package com.kaiz.lifeos.notification.application;

import com.kaiz.lifeos.notification.application.dto.NotificationDto;
import com.kaiz.lifeos.notification.domain.Notification;
import java.util.List;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface NotificationMapper {

  NotificationDto toNotificationDto(Notification notification);

  List<NotificationDto> toNotificationDtoList(List<Notification> notifications);
}
