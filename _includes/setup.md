{% capture setup_cache %}

Including [Tenkan](https://github.com/kizu/tenkan)

    {% include tenkan/setup.md %}

Setting the easier title to processed one

    {% assign title = processed_title %}

Getting the language from the categories of url

    {% assign lang = site.default_lang %}

    {% for l in site.langs %}
        {% if l != site.default_lang %}
            {% capture lang_search_string %}/{{ l }}/{% endcapture %}
            {% if page.categories contains l or page.url contains lang_search_string %}
                {% assign lang = l %}
            {% endif %}
        {% endif %}
    {% endfor %}

Handling links

    {% assign link_handles_input = processed_content %}
    {% include link_handles.html %}
    {% assign processed_content = link_handles_result %}


Looking if the page have a translation

    {% if lang == 'en' %}
        {% capture expected_translation_id %}{{ page.id | replace:'/en/','/' }}{% endcapture %}
    {% else %}
        {% capture expected_translation_id  %}/en{{ page.id }}{% endcapture %}
    {% endif %}

    {% assign posts_ids = site.posts | map:'id' %}

    {% if page.page_type != 'post' or posts_ids contains expected_translation_id %}
        {% assign page_have_translation = true %}
    {% endif %}

Capturing the main category

    {% capture category %}{% if lang == "en" %}{{ page.categories[1] }}{% else %}{{ page.categories[0] }}{% endif %}{% endcapture %}

{% endcapture %}
