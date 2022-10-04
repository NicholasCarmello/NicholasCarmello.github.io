class FiveBy31 {
  constructor() {
    this.get_Hp = document.getElementById("hp").value;
    this.get_d = document.getElementById("d").value;
    this.get_atk = document.getElementById("a").value;
    this.get_sD = document.getElementById("spD").value;
    this.get_speed = document.getElementById("spd").value;
    this.pokemon = {};
    this.stepCounter = 1;
  }

  printSteps(array) {
    for (var i = 0; i < array.length; i++) {
      document.getElementById("textbox").textContent +=
        "Step " +
        this.stepCounter +
        ": Breed the 31 " +
        array[i]["value"] +
        " with the 31 " +
        array[i]["2nd value"] +
        "\n";
      this.stepCounter++;
    }
  }
  start() {
    document.getElementById("textbox").textContent = "";
    var step_count = 0;

    var dicti = {};

    dicti["Hp"] = this.get_Hp;
    dicti["Attk"] = this.get_atk;
    dicti["Def"] = this.get_d;
    dicti["SpD"] = this.get_sD;
    dicti["Speed"] = this.get_speed;

    for (const [key, value] of Object.entries(dicti)) {
      this.insert_into_stack(value, key);
    }

    this.bottom_up();
  }
  insert_into_stack(value, key) {
    if (value == "5") {
      if (!(5 in this.pokemon)) {
        this.pokemon[5] = key;
      }
      if (5 in this.pokemon) {
        this.pokemon[4] = key;
      }
    }
    if (value == "2") {
      this.pokemon[2] = key;
    }
    if (value == "1") {
      this.pokemon[1] = key;
    }
    if (value == "3") {
      this.pokemon[3] = key;
    }
  }
  bottom_up() {
    var first_row = [];
    var second_row = [];
    var third_row = [];
    var fourth_row = [];
    var final_row = [];
    first_row.push({ value: this.pokemon[5], "2nd value": this.pokemon[2] });
    first_row.push({ value: this.pokemon[4], "2nd value": this.pokemon[2] });
    first_row.push({ value: this.pokemon[4], "2nd value": this.pokemon[5] });
    first_row.push({ value: this.pokemon[5], "2nd value": this.pokemon[3] });
    first_row.push({ value: this.pokemon[5], "2nd value": this.pokemon[4] });
    first_row.push({ value: this.pokemon[5], "2nd value": this.pokemon[3] });
    first_row.push({ value: this.pokemon[4], "2nd value": this.pokemon[3] });
    first_row.push({ value: this.pokemon[1], "2nd value": this.pokemon[4] });

    for (var i = 0; i < first_row.length; i += 2) {
      second_row.push({
        value: first_row[i]["value"] + " " + first_row[i]["2nd value"],
        "2nd value":
          first_row[i + 1]["value"] + " " + first_row[i + 1]["2nd value"],
      });
    }
    for (var i = 0; i < second_row.length; i += 2) {
      var first = removeDuplicatesFromString(
        second_row[i]["value"] + " " + second_row[i]["2nd value"]
      );
      var second = removeDuplicatesFromString(
        second_row[i + 1]["value"] + " " + second_row[i + 1]["2nd value"]
      );

      third_row.push({
        value: first,
        "2nd value": second,
      });
    }

    for (var i = 0; i < third_row.length; i += 2) {
      var first = removeDuplicatesFromString(
        third_row[i]["value"] + " " + third_row[i]["2nd value"]
      );
      var second = removeDuplicatesFromString(
        third_row[i + 1]["value"] + " " + third_row[i + 1]["2nd value"]
      );

      fourth_row.push({
        value: first,
        "2nd value": second,
      });
    }

    this.printSteps(first_row);
    this.printSteps(second_row);
    this.printSteps(third_row);
    this.printSteps(fourth_row);
  }
}
function removeDuplicatesFromString(old_string) {
  var new_string = old_string.split(" ");
  new_string = new Set(new_string);

  const str1 = Array.from(new_string).join(" ");
  return str1;
}
function create5x31() {
  var fiveBy31 = new FiveBy31();
  fiveBy31.start();
}

//document.getElementById("event").addEventListener("click", create5x31);
