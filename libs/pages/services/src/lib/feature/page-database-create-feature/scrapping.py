# write a python script to scrap the data from twitter advanced search result page on the keyword "Elon Musk" between
# last november and december 2021

# import the necessary libraries
import requests
from bs4 import BeautifulSoup
import pandas as pd
import time
import random

# define the function to scrap the data
def scrap_data(url):
    # get the html content of the page
    page = requests.get(url)
    soup = BeautifulSoup(page.content, 'html.parser')
    # find the div with the class "css-1dbjc4n r-1iusvr4 r-16y2uox r-1777fci r-1mi0q7o"
    divs = soup.find_all("div", {"class": "css-1dbjc4n r-1iusvr4 r-16y2uox r-1777fci r-1mi0q7o"})
    # create an empty list to store the scrapped data
    scrapped_data = []
    # loop through the divs
    for div in divs:
        # find the div with the class "css-1dbjc4n r-1awozwy r-18u37iz r-1wtj0ep"
        div1 = div.find("div", {"class": "css-1dbjc4n r-1awozwy r-18u37iz r-1wtj0ep"})
        # find the div with the class "css-1dbjc4n r-1awozwy r-18u37iz r-1wtj0ep"
        div2 = div.find("div", {"class": "css-1dbjc4n r-1awozwy r-18u37iz r-1wtj0ep"})
        # find the div with the class "css-1dbjc4n r-1awozwy r-18u37iz r-1wtj0ep"
        div3 = div.find("div", {"class": "css-1dbjc4n r-1awozwy r-18u37iz r-1wtj0ep"})
        # find the div with the class "css-1dbjc4n r-1awozwy r-18u37iz r-1wtj0ep"
        div4 = div.find("div", {"class": "css-1dbjc4n r-1awozwy r-18u37iz r-1wtj0ep"})
        # find the div with the class "css-1dbjc4n r-1awozwy r-18u37iz r-1wtj0ep"
        div5 = div.find("div", {"class": "css-1dbjc4n r-1awozwy r-18u37iz r-1wtj0ep"})
        # find the div with the class "css-1dbjc4n r-1awozwy r-18u37iz r-1wtj0ep"
        div6 = div.find("div", {"class": "css-1dbjc4n r-1awozwy r-18u37iz r-1wtj0ep"})
        # find the div with the class "css-1dbjc4n r-1awozwy r-18u37iz r-1wtj0ep"
        div7 = div.find("div", {"class": "css-1dbjc4n r-1awozwy r-18u37iz r-1wtj0ep"})
