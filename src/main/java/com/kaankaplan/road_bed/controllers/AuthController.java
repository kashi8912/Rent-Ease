package com.kaankaplan.road_bed.controllers;

import com.kaankaplan.road_bed.business.abstracts.AuthService;
import com.kaankaplan.road_bed.business.abstracts.TenantService;
import com.kaankaplan.road_bed.dtos.LoginRequest;
import com.kaankaplan.road_bed.dtos.LoginResponse;
import com.kaankaplan.road_bed.dtos.RefreshRequest;
import com.kaankaplan.road_bed.dtos.TenantRegisterRequest;
import com.kaankaplan.road_bed.dtos.TenantResponse;
import com.kaankaplan.road_bed.dtos.TenantResponseMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("auth/")
public class AuthController {

    private final AuthService authService;
    private final TenantService tenantService;
    private final TenantResponseMapper tenantResponseMapper;

    @Autowired
    public AuthController(
            AuthService authService,
            TenantService tenantService,
            TenantResponseMapper tenantResponseMapper
    ) {
        this.authService = authService;
        this.tenantService = tenantService;
        this.tenantResponseMapper = tenantResponseMapper;
    }

    @PostMapping("register")
    public TenantResponse register(
            @RequestBody TenantRegisterRequest tenantRegisterRequest
    ) {
        return tenantResponseMapper.toResponse(
                tenantService.saveTenant(tenantRegisterRequest)
        );
    }

    @PostMapping("login")
    public LoginResponse login(@RequestBody LoginRequest loginRequest) {
        return authService.login(loginRequest);
    }

    @PostMapping("logout")
    public String logout(@RequestBody RefreshRequest refreshRequest) {
        authService.logout(refreshRequest);
        return "LoggedOut";
    }

    @PostMapping("refresh/accessToken")
    public LoginResponse refreshToken(@RequestBody RefreshRequest refreshRequest) {
        return authService.refreshToken(refreshRequest);
    }
}