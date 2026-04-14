<?php
/**
 * Plugin Name: Headless Mode
 * Description: Redirects the WordPress public frontend to the Next.js app. Editors still use wp-admin normally.
 */

if (!defined('HEADLESS_FRONTEND_URL')) {
    $configured_frontend_url = getenv('HEADLESS_FRONTEND_URL');

    if (!$configured_frontend_url) {
        $configured_frontend_url = 'https://olgaemma.com';
    }

    define('HEADLESS_FRONTEND_URL', $configured_frontend_url);
}

function olga_headless_frontend_url() {
    return untrailingslashit(HEADLESS_FRONTEND_URL);
}

function olga_headless_post_url($post) {
    $post_object = get_post($post);

    if (!$post_object) {
        return olga_headless_frontend_url();
    }

    return olga_headless_frontend_url() . '/blog/' . $post_object->post_name;
}

function olga_headless_page_url($post) {
    $post_object = get_post($post);

    if (!$post_object) {
        return olga_headless_frontend_url();
    }

    if ((int) get_option('page_on_front') === (int) $post_object->ID) {
        return olga_headless_frontend_url();
    }

    return olga_headless_frontend_url() . '/' . $post_object->post_name;
}

add_action('admin_notices', function () {
    $url = olga_headless_frontend_url();
    echo '<div class="notice notice-info"><p>This WordPress instance is running in headless mode. The public website is at <a href="' . esc_url($url) . '" target="_blank" rel="noopener noreferrer">' . esc_html($url) . '</a>.</p></div>';
});

add_filter('post_link', function ($url, $post) {
    return olga_headless_post_url($post);
}, 10, 2);

add_filter('preview_post_link', function ($url, $post) {
    return olga_headless_post_url($post);
}, 10, 2);

add_filter('page_link', function ($url, $post_id) {
    return olga_headless_page_url($post_id);
}, 10, 2);

add_action('template_redirect', function () {
    if (is_admin() || wp_doing_ajax() || wp_doing_cron() || (defined('REST_REQUEST') && REST_REQUEST) || (defined('GRAPHQL_REQUEST') && GRAPHQL_REQUEST)) {
        return;
    }

    $frontend = olga_headless_frontend_url();

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
