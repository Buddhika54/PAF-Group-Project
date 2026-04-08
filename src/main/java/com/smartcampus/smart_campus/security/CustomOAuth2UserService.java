package com.smartcampus.smart_campus.security;

import com.smartcampus.smart_campus.model.User;
import com.smartcampus.smart_campus.repository.UserRepository;
import org.springframework.security.oauth2.client.userinfo.DefaultOAuth2UserService;
import org.springframework.security.oauth2.client.userinfo.OAuth2UserRequest;
import org.springframework.security.oauth2.core.OAuth2AuthenticationException;
import org.springframework.security.oauth2.core.user.DefaultOAuth2User;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.security.oauth2.core.user.OAuth2UserAuthority;
import org.springframework.stereotype.Service;

import java.util.Collections;
import java.util.Map;
import java.util.Optional;

/**
 * Loads the OAuth2 user from Google and persists / updates the User entity
 * in the Neon PostgreSQL database.
 */
@Service
public class CustomOAuth2UserService extends DefaultOAuth2UserService {

    private final UserRepository userRepository;

    public CustomOAuth2UserService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @Override
    public OAuth2User loadUser(OAuth2UserRequest userRequest) throws OAuth2AuthenticationException {
        OAuth2User oAuth2User = super.loadUser(userRequest);

        String provider = userRequest.getClientRegistration().getRegistrationId(); // "google"
        Map<String, Object> attributes = oAuth2User.getAttributes();

        String oauthId     = (String) attributes.get("sub");
        String email       = (String) attributes.get("email");
        String name        = (String) attributes.get("name");
        String picture     = (String) attributes.get("picture");

        // Lookup or create the User in the DB
        User user = resolveUser(oauthId, email, name, picture, provider);

        // Expose the user's email as the "name attribute key" so Spring can
        // identify the principal easily later in the success handler.
        return new DefaultOAuth2User(
                Collections.singleton(new OAuth2UserAuthority("ROLE_" + user.getRole().name(), attributes)),
                attributes,
                "email"
        );
    }

    private User resolveUser(String oauthId, String email, String name,
                             String picture, String provider) {
        // 1. Already linked via oauthId?
        Optional<User> byOauthId = userRepository.findByOauthId(oauthId);
        if (byOauthId.isPresent()) {
            User existing = byOauthId.get();
            existing.setName(name);
            existing.setProfilePicture(picture);
            return userRepository.save(existing);
        }

        // 2. Account with same email exists (was created via email/password) → link provider
        Optional<User> byEmail = userRepository.findByEmail(email);
        if (byEmail.isPresent()) {
            User existing = byEmail.get();
            existing.setOauthId(oauthId);
            existing.setOauthProvider(provider);
            existing.setName(name);
            existing.setProfilePicture(picture);
            return userRepository.save(existing);
        }

        // 3. Brand-new user → create a record
        User newUser = new User();
        newUser.setEmail(email);
        newUser.setUsername(generateUsername(email));
        newUser.setPassword("");          // no password for OAuth users
        newUser.setName(name);
        newUser.setProfilePicture(picture);
        newUser.setOauthId(oauthId);
        newUser.setOauthProvider(provider);
        newUser.setRole(User.Role.USER);
        newUser.setIsActive(true);
        return userRepository.save(newUser);
    }

    /** Derive a unique username from the email local-part */
    private String generateUsername(String email) {
        String base = email.split("@")[0].replaceAll("[^a-zA-Z0-9_]", "_");
        // Append a short suffix to avoid collisions
        return base + "_" + Long.toHexString(System.currentTimeMillis()).substring(6);
    }
}
