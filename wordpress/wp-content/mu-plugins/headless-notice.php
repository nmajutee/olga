<?php
/**
 * Plugin Name: Headless Mode
 * Description: Redirects the WordPress public frontend to the Next.js app. Editors still use wp-admin normally.
 */

define('HEADLESS_FRONTEND_URL', 'http://localhost:3000');

add_action('admin_notices', function () {
    $url = HEADLESS_FRONTEND_URL;
    echo '<div class="notice notice-info"><p>This WordPress instance is running in headless mode. The public website is at <a href="' . esc_url($url) . '" target="_blank">' . esc_html($url) . '</a>.</p></div>';
});

add_action('template_redirect', function () {
    if (is_admin() || wp_doing_ajax() || wp_doing_cron() || (defined('REST_REQUEST') && REST_REQUEST) || (defined('GRAPHQL_REQUEST') && GRAPHQL_REQUEST)) {
        return;
    }

    $frontend = untrailingslashit(HEADLESS_FRONTEND_URL);

    if (is_singular('post')) {
        $slug = get_post_field('post_name', get_queried_object_id());
        wp_redirect($frontend . '/blog/' . $slug, 302);
        exit;
    }

    if (is_home() || is_category() || is_tag() || is_author() || is_date()) {
        wp_redirect($frontend . '/blog', 302);
        exit;
    }

    if (is_page()) {
        $slug = get_post_field('post_name', get_queried_object_id());
        wp_redirect($frontend . '/' . $slug, 302);
        exit;
    }

    if (is_front_page()) {
        wp_redirect($frontend, 302);
        exit;
    }

    wp_redirect($frontend, 302);
    exit;
});