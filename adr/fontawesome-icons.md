# FontAwesome Icons

## Context

FontAwesome icons is a burden to maintain because we have to manually create an IconAwesomeEnum entry and an icons.scss class for each UTF-8 code.
This doesn't scale very well and limited us from using other FontAwesome styles (sharp, regular...)
In addition we manually have in our source code font files (woff, woff2, ttf ...) which doesn't provide version info.
We ideally want to migrate slowly on the new solution and avoid performance impacts as possible.
We also care about the future if we change our icon library at some point.

## Decision

FontAwesome currently provides 2 ways of using it, via Web Fonts and via SVG.

### SVG

**Pros**:

- Sharper
- SVG support is fine on every browser
- It can be easily swappable
- Color can be changed precisely
- FontAwesome as a SVG react bridge with https://github.com/FortAwesome/react-fontawesome (currently not maintained very well)

**Cons**:

- SVG can became performance bottle neck when displaying a lot of icons. SVG sprite can solve some of the issue but there are currently no automatic way of doing it using FontAwesome https://fontawesome.com/docs/web/add-icons/svg-sprites
- Can produce a lot of DOM element (and React isn't good at creating many of it)

SVG would require a whole new level of infrastructure like https://iconify.design/ to be truly performant and swappable as ease. This is theorically the best solution but it overpass our current team efforts.

### Web Fonts

**Pros**:

- Establish standard
- Easy to setup

**Cons**:

- Blurier
- Load as bundle
- Bundle size (currently at 587B)

Even if Web Fonts isn't the most performant solution it's reasonably ok in terms of size.
Its align currently with our team capacity and will allow to transition slowly from our custom system to a standardized one.
However we need to bring an architecture which doesn't vendor lock us to FontAwesome.

## Consequences

FontAwesome provides "Kit" with can handle custom icons and subsetting the whole bundle.
Kit can be installed as node_modules and provides necessary typescript types.
In addition "Kit" comes with both SVG and Web Font assets, so even if currently rely on Web Font it will allow you to transition to SVG if we want/need to.
However we heavily rely on typescript types to allow compilation check and have our backs if we need to move aways from FontAwesome.
