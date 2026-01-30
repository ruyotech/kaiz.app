package app.kaiz.essentia.application.dto;

import app.kaiz.essentia.domain.CardType;

public record EssentiaCardDto(
    String id, CardType type, Integer order, String title, String text, String imageUrl) {}
