{% capture tenkan_cache %}
    {% unless toc_input or toc_input == '' %}
        {% assign toc_input = page %}
    {% endunless %}
    {% assign toc_result = '' %}
    {% include tenkan/toc.md %}
    {% for toc_id in toc_headers_id %}
        {% if toc_headers_indexes[forloop.index0] != '' and toc_headers_indexes[forloop.index0] != '1' %}
            {% capture toc_result %}{{ toc_result }}<a class="item{% if toc_headers_indexes[forloop.index0] != '2' %} item_{{ toc_headers_indexes[forloop.index0] | minus:1 }}{% endif %}" href="#{{ toc_id }}">{{ toc_headers_contents[forloop.index0] }}</a>, {% endcapture %}
        {% endif %}
    {% endfor %}
    {% assign toc_input = '' %}
{% endcapture %}{{ toc_result }}
