'''
Script to extract top 50 open restaurants in Las Vegas, Phoenix, and Charlotte
'''
import json 

# filter open restaurants in Las Vegas, Phoenix, and Charlotte from all businesses
data = {
    "name": "Cities",
    "children": [
        {
            "name": "Las Vegas",
            "children": []
        },
        {
            "name": "Phoenix",
            "children": []
        },
        {
            "name": "Charlotte",
            "children": []
        }
    ]
}
with open("business.json", 'r') as f:
    for line in f:
        temp = json.loads(line)
        if(temp["categories"] != None):
            categories = temp["categories"].split(", ")
        else:
            continue
        if(temp["is_open"] == 1 and "Restaurants" in categories):
            # include only the required information for each restaurant
            restaurant = {}
            restaurant["business_id"] = temp["business_id"]
            restaurant["name"] = temp["name"]
            restaurant["review_count"] = temp["review_count"]
            restaurant["categories"] = temp["categories"]
            
            if(temp["city"] == "Las Vegas"):
                data["children"][0]["children"].append(restaurant)
            elif(temp["city"] == "Phoenix"):
                data["children"][1]["children"].append(restaurant)
            elif(temp["city"] == "Charlotte"):
                data["children"][2]["children"].append(restaurant)
        
# sort restaurants by review count (descending) and store only the top 50 for each city
for i in range(3):
    data["children"][i]["children"] = sorted(data["children"][i]["children"], key = lambda x: x["review_count"])
    data["children"][i]["children"] = data["children"][i]["children"][::-1]
    data["children"][i]["children"] = data["children"][i]["children"][:50]
    
# write data to json file
with open("cities.json", "w") as f:
    json.dump(data, f, indent = 4)