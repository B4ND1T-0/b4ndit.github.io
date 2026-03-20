async function getJson(jsonPath) {
  const res = await fetch(window.location.href + jsonPath);
  const text = await res.text();
  const stats = JSON.parse(text);
  return stats;
}

function populateMembers(where, members) {
  const table = document.querySelector(where);
  if (table === null) {
    console.error("Failed to insert members table. Cannot find <table> tag");
    return;
  }
  const colGroup = document.createElement("colgroup");
  const colLeft = document.createElement("col");
  const colRight = document.createElement("col");
  colLeft.style.width = "25%";
  colRight.style.width = "75%";
  colGroup.appendChild(colLeft);
  colGroup.appendChild(colRight);
  table.appendChild(colGroup);

  members.forEach((member) => {
    const tr = document.createElement("tr");
    const tdImage = document.createElement("td");
    const img = document.createElement("img");
    const tdMemberDescription = document.createElement("td");
    const divMemberDescription = document.createElement("div");
    const divTags = document.createElement("div");
    const pName = document.createElement("p");
    const divBio = document.createElement("div");

    img.src = window.location.href + `/assets/profile/${member.name}.png`;
    img.onerror = () => img.src = window.location.href + `/assets/profile/default.png`;
    img.alt = member.name;
    img.className = "member-pfp";
    tdImage.appendChild(img);

    divMemberDescription.className = "member-description";
    divTags.className = "tags";

    member.tags.forEach((tag) => {
      const spanTag = document.createElement("span");
      spanTag.className = "tag";
      spanTag.setAttribute("data-tag", tag);
      divTags.appendChild(spanTag);
    });

    pName.className = "name";
    pName.textContent = member.name;

    if (member.note !== undefined) {
      pName.setAttribute("data-note", member.note);
    }

    divBio.className = "bio";
    member.bio.split("\n").forEach((line) => {
      const spanLine = document.createElement("span");
      spanLine.textContent = line;
      divBio.appendChild(spanLine);
    });

    if (member.socials !== undefined) {
      const ul = document.createElement("ul");
      for (const key in member.socials) {
        if (member.socials.hasOwnProperty(key)) {
          const what = key;
          const link = member.socials[what];
          const li = document.createElement("li");
          const aLink = document.createElement("a");
          aLink.href = link;
          aLink.target = "_blank";
          aLink.textContent = what;
          li.appendChild(aLink);
          ul.appendChild(li);
        }
      }
      divBio.appendChild(ul);
    }

    divMemberDescription.appendChild(divTags);
    divMemberDescription.appendChild(pName);
    divMemberDescription.appendChild(divBio);
    tdMemberDescription.appendChild(divMemberDescription);

    tr.appendChild(tdImage);
    tr.appendChild(tdMemberDescription);

    table.appendChild(tr);
  });
}

function populateTeamStats(where, statsJson) {
  // config variables
  const max_ctfs = 10; // Maximum number of CTFs to display from each year

  const table = document.querySelector(where);
  if (table === null) {
    console.error("Failed to insert members table. Cannot find <table> tag");
  }

  const colGroup = document.createElement("colgroup");
  const col1 = document.createElement("col");
  const col2 = document.createElement("col");
  const col3 = document.createElement("col");
  col1.style.width = "20%";
  col2.style.width = "20%";
  col3.style.width = "60%";
  colGroup.appendChild(col1);
  colGroup.appendChild(col2);
  colGroup.appendChild(col3);
  table.appendChild(colGroup);

  const trHeading = document.createElement("tr");
  const tdHeadingYear = document.createElement("td");
  const tdHeadingRank = document.createElement("td");
  const tdHeadingCTF = document.createElement("td");
  tdHeadingYear.innerText = "Year";
  tdHeadingRank.innerText = "Rank";
  tdHeadingCTF.innerText = "CTF";
  trHeading.appendChild(tdHeadingYear);
  trHeading.appendChild(tdHeadingRank);
  trHeading.appendChild(tdHeadingCTF);
  table.appendChild(trHeading);

  function getCTFScore(ctf) {
    return Number(ctf.points) / Number(ctf.place);
  }

  statsJson.forEach((record) => {
    const ctfs = record.ctfs
      .sort((a, b) => getCTFScore(b) - getCTFScore(a))
      .slice(0, max_ctfs);

    ctfs.forEach((ctf, i) => {
      const tr = document.createElement("tr");
      const tdRank = document.createElement("td");
      const tdCTF = document.createElement("td");
      if (i == 0) {
        const tdYear = document.createElement("td");
        tdYear.innerText = record.year;
        tdYear.rowSpan = ctfs;
        tr.appendChild(tdYear);
      }
      tdRank.innerText = ctf.place;
      tdCTF.innerText = ctf.event;
      tr.appendChild(tdRank);
      tr.appendChild(tdCTF);
      table.appendChild(tr);
    });
  });
}

function showSplashAnimation() {
  // config variables
  const repeat = 3;
  const animationSpeed = 30; // (in milliseconds)

  const letters = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
  const title = document.querySelector(".splash-title");
  const titleString = title.textContent;
  let iterations = 0;
  const interval = setInterval(() => {
    title.textContent = title.textContent
      .split("")
      .map((_letter, index) => {
        if (index < iterations) {
          return titleString[index];
        }
        return letters[Math.floor(Math.random() * letters.length)];
      })
      .join("");
    iterations += 1 / repeat;
    if (titleString.length < iterations) {
      clearInterval(interval);
      hideSplashScreen();
    }
  }, animationSpeed);

  function hideSplashScreen() {
    // config variables (in milliseconds)
    const delay = 750;
    const transitionSpeed = 300;

    setTimeout(() => {
      const splash = document.querySelector(".splash");
      splash.style.transition = `${transitionSpeed / 1000}s`;
      splash.style.opacity = 0;
      setTimeout(() => {
        splash.style.display = "none";
      }, transitionSpeed);
    }, delay);
  }
}

// Main
showSplashAnimation();
getJson("/data/members.json")
  .then(data => populateMembers(".active-members",data));
getJson("/data/past_members.json")
  .then(data => populateMembers(".past-members",data));
getJson("/data/teamstats.json")
  .then(data => populateTeamStats(".team-stats", data));
