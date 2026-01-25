package com.kaiz.lifeos.essentia.application.dto;

import com.kaiz.lifeos.essentia.domain.CardType;

public record EssentiaCardDto(
    String id,
    CardType type,
    Integer order,
    String title,
    String text,
    String imageUrl) {}
