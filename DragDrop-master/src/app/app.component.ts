import { Component, ViewEncapsulation, OnInit, Renderer2, RendererFactory2, Inject, Input, OnChanges, HostListener } from '@angular/core';
import { CdkDragDrop, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';
import { DOCUMENT } from '@angular/platform-browser';
import $ from 'jquery';
import 'jquery-ui/ui/widgets/draggable.js';
import { interval } from 'rxjs';
import { ToastrService } from 'ngx-toastr';
import { saveAs } from 'file-saver';
import * as moment from 'moment-timezone';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class AppComponent implements OnInit {
  public isLoading = true;
  public drawImage: any;
  public subHeight = 0;
  // Tạo height động cho thẻ svg
  public heightSVG = '100vh';

  public subClass = [];
  public classQuerySelector = [];

  public listClass = [];
  public menuList1 = [];
  public listArrow = [];
  public listdivA = [];
  public listdivB = [];

  public posnALeft = [];
  public posnBLeft = [];

  public arrowLeft = [];

  public listInput = [];

  constructor(
    public toastr: ToastrService
  ) {
  }
  ngOnInit() {
    // Show loading
    setTimeout(() =>  {
    this.isLoading = false;
    this.showMessage();
    }, 3000);
  }

  // Show Message
  public showMessage() {
    setTimeout(() => {
      this.toastr.info('Click hình để thêm', '', { timeOut: 5000 });
    }, 1000);
  }

  // Push hai hình trước khi vẽ
  public dropImageBottom(item) {
    this.subClass.push(item.id);
    if (this.subClass.length > 1) {
      this.listClass.push({
        // idDiv: 2 id của hai điểm
        idDiv: this.subClass,
        // idArrow: 2 điểm có một mủi tên
        idArrow: 'arrow' + this.listClass.length
      });
      // Gọi hàm vẽ mủi tên
      this.draw('bottom');
    }
  }

  public drop(event) {
    const subEvent = event;
    const count = this.menuList1.length;
    // Tạo id động cho từng hình
    subEvent.id = 'a' + count;
    subEvent.idText = 'form' + count;
    this.menuList1.unshift(JSON.parse(JSON.stringify(subEvent)));
    // Delay để gọi hàm Drag của Jquery
    setTimeout(() => {
      this.initDraw();
    }, 500);
    // Show message
    if (this.menuList1.length < 2) {
      this.toastr.info('Di chuyển hình !!', '', { timeOut: 5000 });
      setTimeout(() => {
        this.toastr.info('Nhấn delete để xóa !!', '', { timeOut: 5000 });
      }, 2000);
    }
  }

  public exportJson() {
    let dataKey: any;
    let dataOption: any;
    const exportJson = [];
    for (const item of this.listClass) {
      let obj;
      // Lấy value từ id input tag
       dataKey = $('#' + item.idDiv[0].replace('a', 'form').toString())[0].value;
       dataOption = $('#' + item.idDiv[1].replace('a', 'form').toString())[0].value;
      const index = this.isExist(exportJson, dataKey);
      if (index === -1) {
        obj = {
           key: dataKey,
          option: [dataOption]
        };
      } else {
        (exportJson[index].option as string[]).push(dataOption);
      }
      if (obj) {
        exportJson.push(obj);
      }
    }
    if (exportJson.length <= 0) {
      this.toastr.error('Chưa có dữ liệu !!');
    } else if (dataKey === '' || dataOption === '') {
      this.toastr.error('Vui lòng nhập dữ liệu !!');
    } else {
      const subArr = Object.assign({}, exportJson);
      const json = JSON.stringify(subArr);
      const blob = new Blob([json], {type: 'application/json'});
      saveAs(blob, 'data' + this.convertDateFileName(new Date()) + '.json');
    }


  }

  // Kiếm tra tồn tại của key
  isExist(exportJson, key) {
    let index = 0;
    for (const item of exportJson) {
      if (item && item.key === key.toString()) {
        return index;
      }
      index++;
    }
    return -1;
  }

// Lấy tên file theo ngày giờ
  public convertDateFileName(date: Date): string {
    const value = moment(date);
    return value.format('_YYYYMMDD' + 'hhmmss');
  }

  public draw(location) {
    // Có đủ hai điểm để vẽ mủi tên
    if (this.subClass.length > 1) {
      this.subClass = [];
      this.classQuerySelector = [];
      this.listArrow = [];
      this.posnALeft = [];
      this.posnBLeft = [];
      for (let i = 0; i < this.listClass.length; i++) {
        this.listArrow.push(this.listClass[i].idArrow);
        const subClassQuerySelector = [];
        for (let e = 0; e < this.listClass[i].idDiv.length; e++) {
          // Push querySelector id của hai hình để lấy vị trí
          subClassQuerySelector.push(document.querySelector('#' + this.listClass[i].idDiv[e]));
        }
        this.classQuerySelector.push(subClassQuerySelector);
      }
      // Chạy for lấy 2 vị trí x và y của hai hình để xác định vị trí vẽ mủi tên
      for (let i = 0; i < this.classQuerySelector.length; i++) {
        for (let e = 0; e < this.classQuerySelector[i].length; e++) {
          if (e === 0) {
            // Vị trí x, y hình 1
              this.posnALeft.push({
                x: this.classQuerySelector[i][e].offsetLeft - 5,
                y: this.classQuerySelector[i][e].offsetTop + (this.classQuerySelector[i][e].offsetHeight / 2)
              });
          } else {
            // Vị trí x, y hình 2
            this.posnBLeft.push({
              x: this.classQuerySelector[i][e].offsetLeft - 5,
              y: this.classQuerySelector[i][e].offsetTop + (this.classQuerySelector[i][e].offsetHeight / 2)
            });
          }
        }
      }
      this.arrowLeft = [];
      // Chạy for cho nhiều mủi tên của nhiều cặp hình
      for (let i = 0; i < this.listArrow.length; i++) {
        let subArrow: any;
        // interval 0,5s để html kịp zen mủi tên
        const source = interval(500).subscribe(() => {
          // lấy querySelector của mủi tên
          subArrow = document.querySelector('#' + this.listArrow[i]);
          if (subArrow) {
            this.arrowLeft.push(document.querySelector('#' + this.listArrow[i]));
            source.unsubscribe();
            for (let e = 0; e < this.arrowLeft.length; e++) {
              // Tạo vị trí của mủi tên
              const dStrLeft =
              // 'M' bắt đầu vị trí mủi tên là vị trí x, y của hình 1
              // https://www.w3.org/TR/SVG/paths.html
                'M' +
                (this.posnALeft[e].x + 55) + ',' + (this.posnALeft[e].y) + ' ' +
                 // 'L' vẽ một đường thắng bắt đầu từ điểm 'M' đến điểm x, y của 'L'
                'L' +
                (this.posnBLeft[e].x + 55) + ',' + (this.posnBLeft[e].y);
                // 'C' +
                // (this.posnALeft[e].x + 55) + ',' + (this.posnALeft[e].y) + ' ' +
                // (this.posnBLeft[e].x + 55) + ',' + (this.posnBLeft[e].y) + ' ' +
                // (this.posnBLeft[e].x + 55) + ',' + (this.posnBLeft[e].y);

                // setAttribute để vẽ mủi tên
              this.arrowLeft[e].setAttribute('d', dStrLeft);
            }
          }
        });
      }
    }
  }

  // Function vẽ lại hình khi drag khi đã vẽ mủi tên
  public subDrag(id) {
    const subDiv: any = document.querySelector('#' + id);
    const subHeight1 = subDiv.offsetTop + 50;
    if ( subHeight1 > this.subHeight) {
      this.subHeight = subHeight1;
      this.heightSVG = this.subHeight + 'px';
    }
    if (this.listArrow.length > 0) {
      const avgDiv = [];
      const subArrow = [];
      this.listClass.forEach(element => {
        element.idDiv.filter(item => {
          if (item === id) {
            subArrow.push(element.idArrow);
            avgDiv.push(element.idDiv);
          }
        });
      });

      const arrowLeft = [];
      for (let i = 0; i < subArrow.length; i++) {
        const divA: any = document.querySelector('#' + avgDiv[i][0]);
        const divB: any = document.querySelector('#' + avgDiv[i][1]);
        let subArrow1: any;
        const source = interval(500).subscribe(() => {
          subArrow1 = document.querySelector('#' + subArrow[i]);
          if (subArrow1) {
            arrowLeft.push(document.querySelector('#' + subArrow[i]));
            source.unsubscribe();
            const posnALeft = {
              x: divA.offsetLeft - 5,
              y: divA.offsetTop + (divA.offsetHeight / 2)
            };
            const posnBLeft = {
              x: divB.offsetLeft - 5,
              y: divB.offsetTop + (divB.offsetHeight / 2)
            };
            const dStrLeft =
              'M' +
              (posnALeft.x + 55) + ',' + (posnALeft.y) + ' ' +
              'L' +
              (posnBLeft.x + 55) + ',' + (posnBLeft.y);
              // 'C' +
              // (posnALeft.x + 55) + ',' + (posnALeft.y) + ' ' +
              // (posnBLeft.x + 55) + ',' + (posnBLeft.y) + ' ' +
              // (posnBLeft.x + 55) + ',' + (posnBLeft.y);
            arrowLeft[i].setAttribute('d', dStrLeft);
          }
        });
      }
    }
  }

  // Function apply draggable cho tất cả hình
  public initDraw() {
    const that = this;
    const id = [];
    let subId = '';
    // Push từng id riêng biệt cho hình
    for (let i = 0; i < this.menuList1.length; i++) {
      id.push('#' + this.menuList1[i].id);
    }
    for (let e = 0; e < id.length; e++) {
      (e + 1) === id.length ? subId += id[e] : subId += id[e] + ',';
    }
    $(subId).draggable({
      drag: function (event, ui) {
        const idDrag = event.target.id;
        that.subDrag(idDrag);
      }
    });
  }


  // Bắt sự kiện nút delete để xóa hình
  // Sẽ bắt sự kiện xóa mủi tên sau
  @HostListener('window:keyup', ['$event'])
  keyEvent(event: KeyboardEvent) {
    if (event.keyCode === 46) {
      this.menuList1.pop();
    }
  }

}
