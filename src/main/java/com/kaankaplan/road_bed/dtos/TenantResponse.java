package com.kaankaplan.road_bed.dtos;

import com.kaankaplan.road_bed.entities.Image;

public record TenantResponse(
        String userId,
        String fullName,
        String email,
        Image profilePicture,
        String role
) {
}