package com.kaankaplan.road_bed.dtos;

import com.kaankaplan.road_bed.entities.Tenant;
import org.springframework.stereotype.Component;

@Component
public class TenantResponseMapper {

    public TenantResponse toResponse(Tenant tenant) {

        if (tenant == null) {
            return null;
        }

        String roleName = tenant.role != null
                ? tenant.role.roleName
                : null;

        return new TenantResponse(
                tenant.getUserId(),
                tenant.fullName,
                tenant.email,
                tenant.profilePicture,
                roleName
        );
    }
}